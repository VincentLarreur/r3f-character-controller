import { useRef, useEffect, useMemo, useState } from 'react'
import { MathUtils, Vector3, Quaternion, Matrix4, Raycaster } from 'three'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useRapier } from '@react-three/rapier'

export default function characterController({
    characterRigidBody,
    characterColliderRef,
    actions,
    transparentWalls,
    applyImpulsesToDynamicBodies = true,
    snapToGroundDistance = 0.1,
    characterShapeOffset = 0.1,
    autoStepMaxHeight = 1,
    autoStepMinWidth = 0.5,
    autoStepIncludeDynamicBodies = true,
    accelerationTimeAirborne = 0.2,
    accelerationTimeGrounded = 0.025,
    speedWalk = 2,
    speedRun = 4,
    timeToJumpApex = 1.25,
    maxJumpHeight = 8,
    minJumpHeight = 1,
    velocityXZSmoothing = 0.2,
    velocityXZMin = 0.0001,
    lockCameraIsometric = true,
    isometricCameraPosition = 20
})
{
    const rapier = useRapier()

    let directionVector = new Vector3();
    let positionVector = new Vector3();
    const direction = new Vector3()
    const frontVector = new Vector3()
    const sideVector = new Vector3()
    const characterLinvel = new Vector3()
    const characterTranslation = new Vector3()

    const [ smoothedCameraPosition ] = useState(() => new Vector3())
    const [ smoothedCameraTarget ] = useState(() => new Vector3())

    const [, getKeyboardControls] = useKeyboardControls()

    let temporaryTransparentWalls = []
    let currentAnimation = "Idle"

    const jumpGravity = useMemo(
        () => -(2 * maxJumpHeight) / Math.pow(timeToJumpApex, 2),
        [maxJumpHeight, timeToJumpApex]
    )
    const maxJumpVelocity = useMemo(
        () => Math.abs(jumpGravity) * timeToJumpApex,
        [jumpGravity, timeToJumpApex]
    )
    const minJumpVelocity = useMemo(
        () => Math.sqrt(2 * Math.abs(jumpGravity) * minJumpHeight),
        [jumpGravity, minJumpHeight]
    )
    const horizontalVelocity = useRef({ x: 0, z: 0 })
    const jumpVelocity = useRef(0)
    const holdingJump = useRef(false)
    const jumpTime = useRef(0)
    const jumping = useRef(false)
    const characterController = useRef()

    useEffect(() =>
    {
        const world = rapier.world.raw()

        characterController.current =
            world.createCharacterController(characterShapeOffset)
        characterController.current.enableAutostep(
            autoStepMaxHeight,
            autoStepMinWidth,
            autoStepIncludeDynamicBodies
        )
        characterController.current.enableSnapToGround(snapToGroundDistance)
        characterController.current.setApplyImpulsesToDynamicBodies(
            applyImpulsesToDynamicBodies
        )

        if (actions) {
            actions.Idle.play()
        }

        return () => {
            characterController.current.free()
            characterController.current = null
        }
    }, [
        characterShapeOffset,
        autoStepMaxHeight,
        autoStepMinWidth,
        autoStepIncludeDynamicBodies,
        snapToGroundDistance,
        applyImpulsesToDynamicBodies,
    ])

    useFrame((state, delta) =>
    {
        if (
            !characterRigidBody.current ||
            !characterController.current ||
            !characterColliderRef.current
        ) {
            return
        }

        const { forward, backward, leftward, rightward, jump, sprint } = getKeyboardControls()

        const characterCollider = characterColliderRef.current

        const speed = (1.0 - Math.pow(0.0001, delta)) * (sprint ? speedRun : speedWalk)

        characterLinvel.copy(characterRigidBody.current.linvel())

        const grounded = characterController.current.computedGrounded()

        const smoothing =
            velocityXZSmoothing *
            (grounded ? accelerationTimeGrounded : accelerationTimeAirborne)

        const factor = 1 - Math.pow(smoothing, delta)

        const camera = state.camera

        // x and z movement
        frontVector.set(0, 0, Number(backward) - Number(forward))
        sideVector.set(Number(leftward) - Number(rightward), 0, 0)

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(speed)

        horizontalVelocity.current = {
            x: MathUtils.lerp(
                horizontalVelocity.current.x,
                direction.x,
                factor
            ),
            z: MathUtils.lerp(
                horizontalVelocity.current.z,
                direction.z,
                factor
            ),
        }

        // jumping and gravity
        if (jump && grounded) {
            jumping.current = true
            holdingJump.current = true
            jumpTime.current = state.clock.elapsedTime
            jumpVelocity.current = maxJumpVelocity
        }

        if (!jump && grounded) {
            jumping.current = false
        }

        if (jumping.current && holdingJump.current && !jump) {
            if (jumpVelocity.current > minJumpVelocity) {
                jumpVelocity.current = minJumpVelocity
            }
        }

        if (!jump && grounded) {
            jumpVelocity.current = 0
        } else {
            jumpVelocity.current += jumpGravity * factor
        }

        holdingJump.current = jump

        if (actions) {
            let newAnimation = "Idle"
            if (Math.abs(horizontalVelocity.current.x) > 0.01 || Math.abs(horizontalVelocity.current.z) > 0.01)
            {
                newAnimation = "Walk"
                if (sprint) {
                    newAnimation = "Run"
                }
            }
            if (jumping.current) {
                newAnimation = "Jump_NoHeight"
            }
            if (newAnimation !== currentAnimation) {

                actions[currentAnimation].fadeOut(0.2)
                actions[newAnimation].reset().fadeIn(0.2).play()
                currentAnimation = newAnimation
            }
        }

        // compute movement direction
        let movementDirection = {
            x: horizontalVelocity.current.x,
            y: jumpVelocity.current * factor,
            z: horizontalVelocity.current.z,
        }

        if (Math.abs(movementDirection.x) < velocityXZMin) {
            movementDirection.x = 0
        }
        if (Math.abs(movementDirection.z) < velocityXZMin) {
            movementDirection.z = 0
        }
        // compute collider movement and update rigid body
        characterController.current.computeColliderMovement(
            characterCollider,
            movementDirection
        )

        // Movement
        const translation = characterRigidBody.current.translation()
        const newPosition = characterTranslation.copy(translation)
        const movement = characterController.current.computedMovement()
        newPosition.x += movement.x
        newPosition.y += movement.y
        newPosition.z += movement.z
        characterRigidBody.current.setNextKinematicTranslation(newPosition)
        characterRigidBody.current.setNextKinematicRotation(newPosition)

        // Rotation
        if ( (Math.abs(movement.x) > 0.01 || Math.abs(movement.z) > 0.01)) {
            let matrixLooking = new Matrix4().lookAt(translation, newPosition,new Vector3(0,0,0));
            let rotationQuaternion = new Quaternion().setFromRotationMatrix(matrixLooking);
            rotationQuaternion.x = rotationQuaternion.z = 0
            characterRigidBody.current.setNextKinematicRotation(rotationQuaternion)
        }

        // Camera Isometric
        if (lockCameraIsometric) {
            const cameraPosition = new Vector3(translation.x - isometricCameraPosition, translation.y + isometricCameraPosition, translation.z + isometricCameraPosition)
            smoothedCameraPosition.lerp(cameraPosition, 0.1)
            smoothedCameraTarget.lerp(newPosition, 0.1)
            camera.position.copy(smoothedCameraPosition)
            camera.lookAt(smoothedCameraTarget)
        }

        // Transparent walls between camera and player
        if (transparentWalls) {
            for (let wall of temporaryTransparentWalls) {
                wall.material.opacity = 1
            }
    
            // Transparent walls
            if (transparentWalls && transparentWalls.length > 0) {
                let dir = camera.getWorldDirection( directionVector );
                let pos = camera.getWorldPosition( positionVector);	
                let raycaster = new Raycaster( pos, dir.normalize(), 0, 34 );	
                let intersects = []
                intersects = raycaster.intersectObjects( transparentWalls );
                for (let instersectObject of intersects) {
                    instersectObject.object.material.transparent = true
                    instersectObject.object.material.opacity = 0.25;
                    temporaryTransparentWalls.push(instersectObject.object)
                }
            }
        }
    })
}