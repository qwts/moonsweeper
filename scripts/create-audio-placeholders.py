#!/usr/bin/env python3
"""
Generate minimal placeholder WAV audio files for the MindSweeper extension.
Each file is a simple sine wave tone kept under 10KB total.
"""
import struct
import math
import os

def create_minimal_wav(frequency, duration_ms, filename):
    """Create a minimal WAV file with a simple tone"""
    sample_rate = 8000
    num_samples = int(sample_rate * duration_ms / 1000)
    
    # Generate sine wave
    audio_data = []
    for i in range(num_samples):
        sample = int(32767 * 0.3 * math.sin(2 * math.pi * frequency * i / sample_rate))
        audio_data.append(struct.pack('<h', sample))
    
    audio_bytes = b''.join(audio_data)
    
    # WAV header
    with open(filename, 'wb') as f:
        # RIFF header
        f.write(b'RIFF')
        f.write(struct.pack('<I', 36 + len(audio_bytes)))
        f.write(b'WAVE')
        
        # fmt chunk
        f.write(b'fmt ')
        f.write(struct.pack('<I', 16))  # chunk size
        f.write(struct.pack('<H', 1))   # audio format (PCM)
        f.write(struct.pack('<H', 1))   # num channels
        f.write(struct.pack('<I', sample_rate))
        f.write(struct.pack('<I', sample_rate * 2))  # byte rate
        f.write(struct.pack('<H', 2))   # block align
        f.write(struct.pack('<H', 16))  # bits per sample
        
        # data chunk
        f.write(b'data')
        f.write(struct.pack('<I', len(audio_bytes)))
        f.write(audio_bytes)
    
    return os.path.getsize(filename)

# Create sounds directory
os.makedirs('public/sounds', exist_ok=True)

# Create sound effects
sizes = {}
sizes['reveal'] = create_minimal_wav(800, 200, 'public/sounds/reveal.wav')
sizes['flag'] = create_minimal_wav(600, 200, 'public/sounds/flag.wav')
sizes['win'] = create_minimal_wav(1000, 500, 'public/sounds/win.wav')
sizes['loss'] = create_minimal_wav(200, 400, 'public/sounds/loss.wav')

total_size = sum(sizes.values())
print(f"Created placeholder audio files in public/sounds/:")
for name, size in sizes.items():
    print(f"  - {name}.wav ({size} bytes)")
print(f"\nTotal size: {total_size} bytes ({total_size/1024:.1f} KB)")
