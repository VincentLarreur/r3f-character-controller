import { useRef } from 'react'
import { useControls as useLevaControls } from 'leva'
import { useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import characterController from '../lib'

export default function Player()
{
    const { scene } = useThree()
    let transparentWalls = []
    scene.traverse((obj) => {
        if (obj.name === 'worldObject') {
          transparentWalls.push(obj)
        }
    })
    const group = useRef()
    const characterRigidBody = useRef()
    const characterColliderRef = useRef()

    const { nodes, materials, animations } = useGLTF("./MechRaeTheRedPanda.gltf")
    const { actions } = useAnimations(animations, group)

    const {
        applyImpulsesToDynamicBodies,
        snapToGroundDistance,
        characterShapeOffset,
        autoStepMaxHeight,
        autoStepMinWidth,
        autoStepIncludeDynamicBodies,
        accelerationTimeAirborne,
        accelerationTimeGrounded,
        speedWalk,
        speedRun,
        timeToJumpApex,
        maxJumpHeight,
        minJumpHeight,
        velocityXZSmoothing,
        velocityXZMin,
        isometricCameraPosition,
        lockCameraIsometric
    } = useLevaControls('player-controller', {
        applyImpulsesToDynamicBodies: true,
        snapToGroundDistance: 0.1,
        characterShapeOffset: 0.1,
        autoStepMaxHeight: 1,
        autoStepMinWidth: 0.5,
        autoStepIncludeDynamicBodies: true,
        accelerationTimeAirborne: 0.2,
        accelerationTimeGrounded: 0.025,
        speedWalk: 2,
        speedRun: 4,
        timeToJumpApex: 1.25,
        maxJumpHeight: 8,
        minJumpHeight: 1,
        velocityXZSmoothing: 0.2,
        velocityXZMin: 0.0001,
        isometricCameraPosition: 20,
        lockCameraIsometric: true
    })

    characterController({
        characterRigidBody,
        characterColliderRef,
        actions,
        transparentWalls,
        applyImpulsesToDynamicBodies,
        snapToGroundDistance,
        characterShapeOffset,
        autoStepMaxHeight,
        autoStepMinWidth,
        autoStepIncludeDynamicBodies,
        accelerationTimeAirborne,
        accelerationTimeGrounded,
        speedWalk,
        speedRun,
        timeToJumpApex,
        maxJumpHeight,
        minJumpHeight,
        velocityXZSmoothing,
        velocityXZMin,
        isometricCameraPosition,
        lockCameraIsometric
    })

    return <RigidBody 
        ref={ characterRigidBody } 
        colliders={ false }
        scale={1}
        position={[0, 20, 0]}
        type="kinematicPosition"
        enabledRotations={[false, true, false]}
    >
        <group ref={group} dispose={null} rotation={[0, Math.PI, 0]} >
            <group name="Scene">
                <group name="RobotArmature">
                    <primitive object={nodes.Body} />
                    <primitive object={nodes.FootL} />
                    <primitive object={nodes.FootR} />
                    <skinnedMesh
                        name="Mech"
                        geometry={nodes.Mech.geometry}
                        material={materials.Atlas}
                        skeleton={nodes.Mech.skeleton}
                        castShadow
                    >
                        <CuboidCollider 
                            ref={ characterColliderRef }
                            args={ [ 1.2, 1.75, 1.2 ] }
                            position={ [ 0, 1.75, 0 ] }
                        />
                    </skinnedMesh>
                </group>
            </group>
        </group>
    </RigidBody>
}