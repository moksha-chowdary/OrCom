import math

# Gravitational constant * Earth Mass (km^3 / s^2)
MU_EARTH = 398600.4418

# Earth equatorial radius in km
EARTH_RADIUS_KM = 6378.137

# Earth rotation rate in degrees per second (sidereal day: 86164.0905 s)
EARTH_ROTATION_DEG_PER_SEC = 360.0 / 86164.0905

# Satellite communication horizon limit in km ground distance
DEFAULT_GROUND_HORIZON_KM = 1200.0

# Supported upload languages & formats
SUPPORTED_LANGUAGES = ["python", "onnx", "tflite"]

# Security policy disallowed patterns in submitted workloads (checked as regex words)
DISALLOWED_PATTERNS = [
    r"os\.system",
    r"subprocess",
    r"pty",
    r"socket",
    r"requests",
    r"urllib",
    r"aiohttp",
    r"telnetlib",
    r"paramiko",
    r"shutil\.rmtree",
]
