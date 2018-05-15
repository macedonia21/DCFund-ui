import {Meteor} from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import {HTTP} from 'meteor/http';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';

if (Meteor.isServer) {
    // This code only runs on the server
    // Only publish tasks that are public or belong to the current user
}

Meteor.methods({
    'blocks.get' () {
        if (!Meteor.userId) {
            throw new Meteor.Error('not-authorized');
        }

        try {
            const result = HTTP.get(Meteor.settings.public.apiURL + '/blocks');
            if (result) {
                return result.data.map((block) => {
                    return {
                        "index": block.index,
                        "hash": block.hash
                    }
                }).sort((blockA, blockB) => {
                    return blockB.index - blockA.index;
                });
            } else {
                return null;
            }
        } catch (e) {
            throw new Meteor.Error(e.message);
        }
    },

    'block.get' (blockHash) {
        if (!Meteor.userId) {
            throw new Meteor.Error('not-authorized');
        }

        check(blockHash, String);

        try {
            const result = HTTP.get(Meteor.settings.public.apiURL + '/block/' + blockHash);
            if (result) {
                return result.data;
            } else {
                return null;
            }
        } catch (e) {
            throw new Meteor.Error(e.message);
        }
    },

    'address.get' (address) {
        if (!Meteor.userId) {
            throw new Meteor.Error('not-authorized');
        }

        check(address, String);

        try {
            const result = HTTP.get(Meteor.settings.public.apiURL + '/address/' + address);
            if (result) {
                return result.data.sort((transA, transB) => {
                    return transB.timestamp - transA.timestamp;
                });
            } else {
                return null;
            }
        } catch (e) {
            throw new Meteor.Error(e.message);
        }
    },

    'transaction.get' (transaction) {
        if (!Meteor.userId) {
            throw new Meteor.Error('not-authorized');
        }

        check(transaction, String);

        try {
            const result = HTTP.get(Meteor.settings.public.apiURL + '/transaction/' + transaction);
            if (result) {
                return result.data;
            } else {
                return null;
            }
        } catch (e) {
            throw new Meteor.Error(e.message);
        }
    },

    'balance.get' () {
        if (!Meteor.userId) {
            throw new Meteor.Error('not-authorized');
        }

        try {
            const result = HTTP.get(Meteor.settings.public.apiURL + '/balance/' + Meteor.user().profile.address);
            if (result) {
                return result.data;
            } else {
                return null;
            }
        } catch (e) {
            throw new Meteor.Error(e.message);
        }
    },

    'balance.get' () {
        if (!Meteor.userId) {
            throw new Meteor.Error('not-authorized');
        }

        try {
            const result = HTTP.get(Meteor.settings.public.apiURL + '/balance/' + Meteor.user().profile.address);
            if (result) {
                return result.data;
            } else {
                return null;
            }
        } catch (e) {
            throw new Meteor.Error(e.message);
        }
    },

    'transactionPool.get' (isApprovalPool) {
        if (!Meteor.userId) {
            throw new Meteor.Error('not-authorized');
        }

        check(isApprovalPool, Boolean);

        try {
            let getLink = '';
            if (isApprovalPool) {
                getLink = Meteor.settings.public.apiURL + '/transactionPool';
            } else {
                getLink = Meteor.settings.public.apiURL + '/transactionPool/' + Meteor.user().profile.address
            }
            const result = HTTP.get(getLink);
            if (result) {
                return result.data.sort((transA, transB) => {
                    return transB.txDCFs[0].timestamp - transA.txDCFs[0].timestamp;
                });
            } else {
                return null;
            }
        } catch (e) {
            throw new Meteor.Error(e.message);
        }
    },

    'newRequest.post' (requestData) {
        if (!Meteor.userId) {
            throw new Meteor.Error('not-authorized');
        }

        check(requestData.data.wallet, String);
        check(requestData.data.walletKey, String);
        check(requestData.data.walletOwner, String);
        check(requestData.data.amount, Number);
        check(requestData.data.type, Number);
        check(requestData.data.month, Number);
        check(requestData.data.year, Number);

        try {
            const result = HTTP.post(Meteor.settings.public.apiURL + '/sendTransaction', requestData);
            if (result) {
                return result;
            } else {
                return null;
            }
        } catch (e) {
            throw new Meteor.Error(e.message);
        }
    },

    'removeRequest.post' (requestData) {
        if (!Meteor.userId) {
            throw new Meteor.Error('not-authorized');
        }

        check(requestData.data.txId, String);
        check(requestData.data.signature, String);

        try {
            const result = HTTP.post(Meteor.settings.public.apiURL + '/removeTransaction', requestData);
            if (result) {
                return result;
            } else {
                return null;
            }
        } catch (e) {
            throw new Meteor.Error(e.message);
        }
    },

    'confirmRequest.post' (requestData) {
        if (!Meteor.userId) {
            throw new Meteor.Error('not-authorized');
        }

        check(requestData.data.txId, String);
        check(requestData.data.signature, String);
        check(requestData.data.isApproved, Boolean);

        try {
            const result = HTTP.post(Meteor.settings.public.apiURL + '/confirmBlock', requestData);
            if (result) {
                return result;
            } else {
                return null;
            }
        } catch (e) {
            throw new Meteor.Error(e.message);
        }
    },
    'userUpdateProfile.account' (updateData) {
        if (!Meteor.userId) {
            throw new Meteor.Error('not-authorized');
        }

        check(updateData.data.firstName, String);
        check(updateData.data.lastName, String);

        try {
            Meteor.users.update({_id: Meteor.userId()}, {
                $set: {
                    "profile.firstName": updateData.data.firstName,
                    "profile.lastName": updateData.data.lastName,
                    "profile.fullName": updateData.data.firstName + " " + updateData.data.lastName
                }
            });
        } catch (e) {
            throw new Meteor.Error(e.message);
        }
    },

    'userChangePassword.account' (updateData) {
        if (!Meteor.userId) {
            throw new Meteor.Error('not-authorized');
        }

        check(updateData.data.newPass, String);

        try {
            Accounts.setPassword(Meteor.userId(), updateData.data.newPass)
        } catch (e) {
            throw new Meteor.Error(e.message);
        }
    }
});
