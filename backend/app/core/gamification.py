from math import floor

def calculate_level(xp: int) -> int:

    if xp < 0: return 1
    return floor((xp / 100) ** 0.5) + 1

def calculate_xp_for_next_level(level: int) -> int:

    return (level) ** 2 * 100

def get_rank(level: int) -> str:

    if level < 11: return "Bronze"
    if level < 31: return "Silver"
    if level < 51: return "Gold"
    if level < 71: return "Platinum"
    if level < 91: return "Diamond"
    return "Champion"
