import elliptic from 'elliptic';

// Create a new EC context for secp256k1
const EC = elliptic.ec;
const ec = new EC('secp256k1');


export function getPubKeyFromPrivate(privateKey) {

    // Create a key object from the private key
    const key = ec.keyFromPrivate(privateKey);

    // Get the public key in hex format
    const publicKey = key.getPublic('hex');

    return publicKey;
}

export function generateKeyPair() {

    // Generate a new key pair
    const key = ec.genKeyPair();

    // Get public and private keys in hex format
    const publicKey = key.getPublic('hex');
    const privateKey = key.getPrivate('hex');
    
    return {
        publicKey,
        privateKey
    };
}

export function signature(message, privateKey) {
    // Sign a message with the private key
    const key = ec.keyFromPrivate(privateKey);
    const sig = key.sign(message);
    return sig.toDER('hex');
}