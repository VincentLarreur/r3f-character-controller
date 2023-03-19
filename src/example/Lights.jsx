import { useRef } from 'react'

export default function Lights()
{
    const light = useRef()

    return <>
        <directionalLight
            ref={ light }
            castShadow
            position={ [ 10, 20, 20 ] }
            intensity={ 1.5 }
            shadow-normalBias={ 0.3 }
            shadow-mapSize={ [ 1024, 1024 ] }
            shadow-camera-near={ 1 }
            shadow-camera-far={ 100 }
            shadow-camera-top={ 100 }
            shadow-camera-right={ 100 }
            shadow-camera-bottom={ - 100 }
            shadow-camera-left={ - 100 }
        />
        <ambientLight intensity={ 0.5 } />
    </>
}