import React, { useState, useEffect, useRef } from 'react';

function App() {
    const [bars, setBars] = useState([]);
    const [sorting, setSorting] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null); // State to track active bar
    const [speed, setSpeed] = useState(50)
    const audioContextRef = useRef(null); // Reference to persist the AudioContext

    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
    };

    const generateBars = () => {
        const newBars = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 1);
        setBars(newBars);
        setSorting(false);
    };

    // Function to play sound based on bar value
    const playSound = (value, index) => {
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume(); // Attempt to resume if suspended
        }

        let oscillator = audioContextRef.current.createOscillator();
        oscillator.type = 'sine';

        // Map bar value (1-100) to frequency range (200 Hz - 1000 Hz)
        const frequency = (value / 100) * 800 + 200;
        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
        setActiveIndex(index);
        oscillator.connect(audioContextRef.current.destination);
        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + 0.1);
        setTimeout(() => {
          setActiveIndex(null); // Reset active bar after sound stops
      }, speed);
    };

    const playFinalSounds = async () => {
      for (let i = 0; i < bars.length; i++) {
        playSound(bars[i], i);
        await new Promise(resolve => setTimeout(resolve, speed)); // Ensure each sound is played fully
    }
  };

    const bubbleSort = async () => {
        let arr = [...bars];
        let len = arr.length;
        setSorting(true);
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < len - i - 1; j++) {
              playSound(arr[j+1], j+1)
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; // Swap elements
                    setBars([...arr]);
                    await new Promise(resolve => setTimeout(resolve, speed));
                }
            }
        }
        setSorting(false);
        playFinalSounds()
    };

    useEffect(() => {
        initAudioContext(); // Initialize AudioContext when the component mounts
        generateBars();
    }, []);

    return (
        <div className="flex flex-col items-center p-4">
            <div className="flex space-x-1">
                {bars.map((height, index) => (
                    <div key={index} style={{ height: `${height * 3}px` }} className={`w-2 ${index === activeIndex ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                ))}
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={sorting ? null : bubbleSort}
                disabled={sorting}>
                {sorting ? 'Sorting...' : 'Sort Bars'}
            </button>
            <input type="range" min="10" max="300" value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-64 mt-4"
                disabled={sorting} />
            {/* Show speed value */}
            {!sorting && (
                <p className="text-lg font-medium mt-4">{speed}</p>
                )}
        </div>
    );
}

export default App;
