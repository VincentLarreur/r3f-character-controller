import { Color, Vector3 } from 'three'
import { useGLTF } from "@react-three/drei";
import { Stars } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

export default function World()
{
    const { nodes, materials } = useGLTF("./testWorld.gltf");
    materials["Material.001"].color = new Color("#ccaaaa")

    const position = new Vector3(12, -10, 46)

    return <>
        <Stars radius={100} depth={50} count={5000} fade speed={0.1} />
        <RigidBody type="fixed" colliders="trimesh" scale={2} rotation={[0, Math.PI / 2, 0]} >
            <group 
                dispose={null}
                position={[ position.x, position.y, position.z ] }
            >
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube001.geometry}
                    material={materials["Material.001"].clone()}
                    name="worldObject"
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube002.geometry}
                    material={materials["Material.001"].clone()}
                    name="worldObject"
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube003.geometry}
                    material={materials["Material.001"].clone()}
                    name="worldObject"
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube004.geometry}
                    material={materials["Material.001"].clone()}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube005.geometry}
                    material={materials["Material.001"].clone()}
                    name="worldObject"
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube006.geometry}
                    material={materials["Material.001"].clone()}
                    name="worldObject"
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube007.geometry}
                    material={materials["Material.001"].clone()}
                    name="worldObject"
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube008.geometry}
                    material={materials["Material.001"].clone()}
                    name="worldObject"
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube009.geometry}
                    material={materials["Material.001"].clone()}
                    name="worldObject"
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube010.geometry}
                    material={materials["Material.001"].clone()}
                    name="worldObject"
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube011.geometry}
                    material={materials["Material.001"].clone()}
                    name="worldObject"
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube012.geometry}
                    material={materials["Material.001"].clone()}
                    name="worldObject"
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube013.geometry}
                    material={materials["Material.001"].clone()}
                    name="worldObject"
                />
            </group>
        </RigidBody>
    </>
}