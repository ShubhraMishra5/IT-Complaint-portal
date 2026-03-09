import hashlib
import secrets


def hash_password_scrypt(password: str) -> str:
    salt = secrets.token_bytes(16)
    n = 2**13  # 8192 — reasonable memory usage
    r = 8
    p = 1
    dklen = 64

    hashed = hashlib.scrypt(password.encode(), salt=salt, n=n, r=r, p=p, dklen=dklen)

    return f"scrypt:{n}:{r}:{p}${salt.hex()}${hashed.hex()}"


def verify_password_scrypt(stored_hash: str, password: str) -> bool:
    try:
        # Format: scrypt:<n>:<r>:<p>$<salt_hex>$<hash_hex>
        prefix, salt_hex, hash_hex = stored_hash.split('$')
        if not prefix.startswith("scrypt:"):
            return False

        _, n_str, r_str, p_str = prefix.split(':')
        n, r, p = int(n_str), int(r_str), int(p_str)

        salt = bytes.fromhex(salt_hex)
        original_hash = bytes.fromhex(hash_hex)

        test_hash = hashlib.scrypt(password.encode(), salt=salt, n=n, r=r, p=p, dklen=len(original_hash))

        return test_hash == original_hash
    except Exception as e:
        print("Error during password verification:", e)
        return False


if __name__ == "__main__":
    from getpass import getpass

    password = getpass("Enter password to hash: ")
    hashed_password = hash_password_scrypt(password)
    print("Hashed password:", hashed_password)

    test = getpass("Re-enter password to verify: ")
    print("Match:", verify_password_scrypt(hashed_password, test))

# hashed = hash_password_scrypt("test123")
# print("Hashed password:", hashed)
# print("Verification result:", verify_password_scrypt(hashed, "test123"))