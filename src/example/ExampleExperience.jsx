import { Canvas } from '@react-three/fiber'
import { KeyboardControls, OrbitControls } from '@react-three/drei'
import { Physics, Debug } from '@react-three/rapier'
import { useControls as useLevaControls } from 'leva'
import Lights from './Lights.jsx'
import World from './World.jsx'
import Player from './Player.jsx'

export default function ExampleExperience()
{
    const { debug } = useLevaControls('Debug Panel', {
        debug: false,
    })

    return <KeyboardControls map={ [
        { name: 'forward', keys: [ 'ArrowUp', 'KeyW' ] },
        { name: 'backward', keys: [ 'ArrowDown', 'KeyS' ] },
        { name: 'leftward', keys: [ 'ArrowLeft', 'KeyA' ] },
        { name: 'rightward', keys: [ 'ArrowRight', 'KeyD' ] },
        { name: 'jump', keys: [ 'Space' ] },
        { name: 'sprint', keys: ['Shift'] },
    ] }>
        <Canvas shadows camera={ { fov: 45 } }>
            <Physics>
                {debug && <Debug />}
                <Lights />
                <World />
                <Player />
            </Physics>
        </Canvas>
    </KeyboardControls>
}