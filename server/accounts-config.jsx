import { Accounts } from 'meteor/accounts-base';
import {ec} from 'elliptic';
import * as CryptoJS from 'crypto-js';
import * as bs58 from 'bs58';

Accounts.onCreateUser((options, user) => {
    // Use provided profile in options, or create an empty object
    user.profile = options.profile || {};
    // Additional fields
    console.log(options);
    user.profile.firstName = options.firstName;
    user.profile.lastName = options.lastName;
    user.profile.fullName = options.firstName + " " + options.lastName;
    // Generate wallet
    const wallet = initWallet();
    user.profile.pubKey = wallet.publicKey;
    user.profile.priKey = wallet.privateKey;
    user.profile.address = wallet.address;
    // Roles
    if (options.isUser) {
        user.roles = ['user'];
    }
    // Returns the user object
    return user;
});

const initWallet = () => {
    const EC = new ec('secp256k1');
    const keyPair = EC.genKeyPair();
    const privateKey = keyPair.getPrivate().toString(16);
    const publicKey = keyPair.getPublic().encode('hex');

    //Perform SHA-256 hashing on the public key
    // const hashPubkey = CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(publicKey));
    const hashPubkey = CryptoJS.SHA256(publicKey).toString();

    //Perform RIPEMD-160 hashing on the result of SHA-256
    const ripemdHashPubkey = CryptoJS.RIPEMD160(hashPubkey).toString();

    //Add version byte in front of RIPEMD-160 hash (0x00 for Main Network)
    const version = '5a';
    const prefixRipemdHashPubkey = version + ripemdHashPubkey;

    // Perform SHA-256 hash x2 times on the extended RIPEMD-160 result
    const checksumHash1 = CryptoJS.SHA256(prefixRipemdHashPubkey).toString();
    const checksumHash2 = CryptoJS.SHA256(checksumHash1).toString();
    const addressChecksum = checksumHash2.toString().substr(0,8);

    //Add the 4 checksum bytes from stage 7 at the end of extended RIPEMD-160 hash from stage 4.
    // This is the 25-byte binary Bitcoin Address.
    var unencodedAddress = version + ripemdHashPubkey + addressChecksum;

    //Convert the result from a byte string into a base58 string using Base58Check encoding.
    // This is the most commonly used Bitcoin Address format
    const bytes = Buffer.from(unencodedAddress, 'hex');
    const address = bs58.encode(bytes);

    const wallet = {};
    wallet.privateKey = privateKey;
    wallet.publicKey = publicKey;
    wallet.address = address;

    return wallet;
};