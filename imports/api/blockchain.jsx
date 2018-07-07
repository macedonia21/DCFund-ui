import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Accounts} from 'meteor/accounts-base';
import {HTTP} from 'meteor/http';
import {check} from 'meteor/check';
import {ec} from 'elliptic';
import * as _ from 'lodash';
import * as CryptoJS from 'crypto-js';

export const Requests = new Mongo.Collection('requests');

if (Meteor.isServer) {
    // This code only runs on the server
    // Only publish tasks that are public or belong to the current user
    Meteor.publish('requests', function requestsPublication() {
        return Requests.find({
            $and: [
                {"isApproved": null},
                {"txDCFs.wallet": Meteor.user().profile.address},
            ],
        });
    });

    Meteor.publish('requestsApprove', function requestsPublication() {
        return Requests.find({"isApproved": null});
    });

    Meteor.methods({
        'blocks.get'() {
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

        'block.get'(blockHash) {
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

        'address.get'(address) {
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

        'transaction.get'(transaction) {
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

        'allBalances.get'() {
            if (!Meteor.userId) {
                throw new Meteor.Error('not-authorized');
            }

            try {
                const result = HTTP.get(Meteor.settings.public.apiURL + '/balances');
                if (result) {
                    return result.data;
                } else {
                    return null;
                }
            } catch (e) {
                throw new Meteor.Error(e.message);
            }
        },

        'balance.get'() {
            if (!Meteor.userId) {
                throw new Meteor.Error('not-authorized');
            }

            try {
                let balances = {
                    "myBalance": null,
                    "allBalances": null
                };
                let result = null;
                if (Roles.userIsInRole(Meteor.user(), 'approver')) {
                    // Approver
                    this.unblock();
                    result = HTTP.get(Meteor.settings.public.apiURL + '/balances');
                    if (result) {
                        const data = result.data;
                        balances.myBalance = data.find((balance) => {
                            return balance.wallet === Meteor.user().profile.address;
                        });
                        if (balances.myBalance === undefined || !balances.myBalance) {
                            balances.myBalance = {
                                "wallet": Meteor.user().profile.address,
                                "deposit": 0,
                                "lend": 0
                            };
                        }
                        balances.allBalances = data.filter((balance) => {
                            return balance.wallet !== Meteor.user().profile.address;
                        });
                        return balances;
                    } else {
                        return null;
                    }
                } else {
                    // Other user
                    this.unblock();
                    result = HTTP.get(Meteor.settings.public.apiURL + '/balance/' + Meteor.user().profile.address);
                    if (result) {
                        const data = result.data;
                        balances.myBalance = data.find((balance) => {
                            return balance.wallet === Meteor.user().profile.address;
                        });
                        if (balances.myBalance === undefined || !balances.myBalance) {
                            balances.myBalance = {
                                "wallet": Meteor.user().profile.address,
                                "deposit": 0,
                                "lend": 0
                            }
                        }
                        balances.allBalances = data.filter((balance) => {
                            return balance.wallet !== Meteor.user().profile.address;
                        });
                        return balances;
                    } else {
                        return null;
                    }
                }
            } catch (e) {
                throw new Meteor.Error(e.message);
            }
        },

        'transactionPool.get'(isApprovalPool) {
            if (!Meteor.userId) {
                throw new Meteor.Error('not-authorized');
            }

            check(isApprovalPool, Boolean);

            if ((!isApprovalPool && Roles.userIsInRole(Meteor.user(), 'approver')) ||
                (isApprovalPool && !Roles.userIsInRole(Meteor.user(), 'approver'))) {
                return null;
            }

            try {
                let getLink = '';
                if (isApprovalPool) {
                    getLink = Meteor.settings.public.apiURL + '/transactionPool';
                } else {
                    getLink = Meteor.settings.public.apiURL + '/transactionPool/' + Meteor.user().profile.address
                }
                this.unblock();
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

        'newRequest.post'(requestData) {
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
                // Get balance to check
                let result = HTTP.get(Meteor.settings.public.apiURL + '/balance/' + Meteor.user().profile.address);
                if (result) {
                    const data = result.data;
                    const myBalance = data.find((balance) => {
                        return balance.wallet === Meteor.user().profile.address;
                    });

                    const fundBalances = data.filter((balance) => {
                        return balance.wallet !== Meteor.user().profile.address;
                    });

                    if (requestData.data.type === 2) {
                        // Borrow
                        if ((20 - myBalance.lend) < (fundBalances[0].deposit - fundBalances[0].lend)) {
                            if (requestData.data.amount > (20 - myBalance.lend)) {
                                throw new Meteor.Error('borrow-more-quota',
                                    'Request more than borrow quota ' + (20 - myBalance.lend) + ' DCF');
                            } else if (requestData.data.amount > (fundBalances[0].deposit - fundBalances[0].lend)) {
                                throw new Meteor.Error('borrow-more-fund',
                                    'Request more than available fund ' +
                                    (fundBalances[0].deposit - fundBalances[0].lend) + ' DCF');
                            }
                        } else {
                            if (requestData.data.amount > (fundBalances[0].deposit - fundBalances[0].lend)) {
                                throw new Meteor.Error('borrow-more-fund',
                                    'Request more than available fund ' +
                                    (fundBalances[0].deposit - fundBalances[0].lend) + ' DCF');
                            } else if (requestData.data.amount > (20 - myBalance.lend)) {
                                throw new Meteor.Error('borrow-more-quota',
                                    'Request more than borrow quota ' + (20 - myBalance.lend) + ' DCF');
                            }
                        }
                    } else if (requestData.data.type === 3) {
                        // Pay
                        if (requestData.data.amount > myBalance.lend) {
                            throw new Meteor.Error('pay-more-borrow',
                                'Pay more than borrowing amount ' + myBalance.lend + ' DCF');
                        }
                    }
                } else {
                    throw new Meteor.Error('balance-error', 'Cannot retrieve fund balance');
                }

                result = HTTP.post(Meteor.settings.public.apiURL + '/sendTransaction', requestData);
                if (result) {
                    Requests.insert(result.data);
                    return result;
                } else {
                    return null;
                }
            } catch (e) {
                throw new Meteor.Error(e, e.reason, e.details);
            }
        },

        'removeRequest.post'(requestData) {
            if (!Meteor.userId) {
                throw new Meteor.Error('not-authorized');
            }

            check(requestData.data.txId, String);

            const dataToSign = requestData.data.txId;
            const priKey = Meteor.user().profile.priKey;
            const EC = new ec('secp256k1');
            const key = EC.keyFromPrivate(priKey, 'hex');
            requestData.data.signature = Array.from(key.sign(dataToSign).toDER(), (byte) => {
                return ('0' + (byte & 0xFF).toString(16)).slice(-2);
            }).join('');

            try {
                const result = HTTP.post(Meteor.settings.public.apiURL + '/removeTransaction', requestData);
                if (result) {
                    if (result.data) {
                        Requests.remove({
                            id: requestData.data.txId
                        });
                    }
                    return result;
                } else {
                    return null;
                }
            } catch (e) {
                throw new Meteor.Error(e.message);
            }
        },

        'confirmRequest.post'(requestData) {
            if (!Meteor.userId) {
                throw new Meteor.Error('not-authorized');
            }

            check(requestData.data.txId, String);
            check(requestData.data.isApproved, Boolean);

            const dataToSign = requestData.data.txId;
            const priKey = Meteor.user().profile.priKey;
            const EC = new ec('secp256k1');
            const key = EC.keyFromPrivate(priKey, 'hex');
            requestData.data.signature = Array.from(key.sign(dataToSign).toDER(), (byte) => {
                return ('0' + (byte & 0xFF).toString(16)).slice(-2);
            }).join('');

            try {
                const result = HTTP.post(Meteor.settings.public.apiURL + '/confirmBlock', requestData);
                if (result) {
                    Requests.update({
                        id: requestData.data.txId
                    }, {$set: {isApproved: requestData.data.isApproved}});
                    return result;
                } else {
                    return null;
                }
            } catch (e) {
                throw new Meteor.Error(e.message);
            }
        },

        'userUpdateProfile.account'(updateData) {
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

        'report.get'() {
            if (!Meteor.userId) {
                throw new Meteor.Error('not-authorized');
            }

            try {
                const result = HTTP.get(Meteor.settings.public.apiURL + '/blocks');
                if (result) {
                    if (result.data) {
                        let reportData = {
                            borrowReportData: null,
                            borrowChartData: null,
                            depositReportData: null,
                            fundTotal: 0,
                        };
                        const blockData = _.filter(result.data.slice(1), (block) => {
                            return block.data[0].isApproved === true
                        });

                        // Wallet Balances
                        const walletBalances = _.last(blockData).balances;

                        reportData.fundTotal = walletBalances[0].deposit;

                        // Wallet Owner
                        const ownerStep1 = _.map(blockData, (block) => {
                            return block.data[0].txDCFs[0]
                        });
                        const ownerStep2 = _.groupBy(ownerStep1, 'wallet');
                        const walletOwner = _.mapValues(ownerStep2, (txDCFs) => {
                            return _.last(txDCFs).walletOwner;
                        });

                        // Borrow Data
                        const borrowStep1 = _.map(blockData, (block) => {
                            return block.data[0].txDCFs[0]
                        });
                        const borrowStep2 = _.filter(borrowStep1, (txDCF) => {
                            return txDCF.type === 2 || txDCF.type === 3
                        });
                        if (borrowStep2) {
                            const borrowStep3 = _.groupBy(borrowStep2, 'wallet');
                            const borrowStep4 = _.mapValues(borrowStep3, (wallet) => {
                                const lastBorrowDate = new Date(_.last(wallet).timestamp);
                                let dueDate = new Date(lastBorrowDate.getFullYear(), lastBorrowDate.getMonth() + 1, 0);
                                if (lastBorrowDate.getDate() > 20) {
                                    dueDate = new Date(lastBorrowDate.getFullYear(), lastBorrowDate.getMonth() + 2, 0);
                                }

                                return {
                                    borrowTimestamp: lastBorrowDate.getTime(),
                                    dueTimestamp: dueDate.getTime(),
                                    borrowAmount: _.reduce(wallet, (sum, txDCF) => {
                                        return txDCF.type === 2 ? sum + txDCF.amount : sum - txDCF.amount;
                                    }, 0)
                                };
                            });

                            // Remove complete refund Wallet
                            const borrowStep5 = _.pickBy(borrowStep4, function (value, key) {
                                return value.borrowAmount === 0;
                            });
                            const borrowStep6 = _.omit(borrowStep4, _.keys(borrowStep5));

                            if (_.keys(borrowStep6).length > 0) {
                                // Borrow Report Data
                                reportData.borrowReportData = _.mapKeys(borrowStep6, (value, key) => {
                                    return walletOwner[key];
                                });

                                // Borrow Chart Data
                                reportData.borrowChartData = {
                                    key: _.map(_.keys(borrowStep6), (wallet) => {
                                        return walletOwner[wallet];
                                    }),
                                    value: _.map(_.values(borrowStep6), (wallet) => {
                                        return wallet.borrowAmount;
                                    })
                                };
                            }
                        }

                        // Deposit Report Data
                        const depositStep1 = _.map(blockData, (block) => {
                            return block.data[0].txDCFs[0]
                        });
                        const depositStep2 = _.filter(depositStep1, (txDCF) => {
                            return txDCF.type === 0 || txDCF.type === 1
                        });
                        if (depositStep2) {
                            const depositStep3 = _.groupBy(depositStep2, 'wallet');
                            const depositStep4 = _.mapValues(depositStep3, (txDCFs) => {
                                return _.groupBy(txDCFs, (txDCF) => {
                                    return txDCF.month + '.' + txDCF.year;
                                });
                            });
                            const depositStep5 = _.mapValues(depositStep4, (wallet) => {
                                return _.mapValues(wallet, (month) => {
                                    return _.reduce(month, (sum, txDCF) => {
                                        return (txDCF.type === 0 ? sum + txDCF.amount : sum - txDCF.amount);
                                    }, 0);
                                });
                            });
                            const depositStep6 = _.forEach(depositStep5, function (value, key) {
                                return value.walletOwner = walletOwner[key];
                            });

                            reportData.depositReportData = _.forEach(depositStep6, function (value, key) {
                                const walletBalance = _.find(walletBalances, (balance) => {
                                    return balance.wallet === key;
                                });
                                return value.walletDepositTotal = walletBalance.deposit;
                            });
                        }

                        return reportData;
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            } catch (e) {
                throw new Meteor.Error(e.message);
            }
        },

        'withdraw.get'() {
            if (!Meteor.userId) {
                throw new Meteor.Error('not-authorized');
            }

            try {
                this.unblock();
                const result = HTTP.get(Meteor.settings.public.apiURL + '/blocks');
                if (result) {
                    if (result.data) {
                        let depositData = null;

                        const blockData = _.filter(result.data.slice(1), (block) => {
                            return block.data[0].isApproved === true
                        });

                        // Wallet Balances
                        const walletBalances = _.last(blockData).balances;

                        // Wallet Owner
                        const ownerStep1 = _.map(blockData, (block) => {
                            return block.data[0].txDCFs[0]
                        });
                        const ownerStep2 = _.groupBy(ownerStep1, 'wallet');
                        const walletOwner = _.mapValues(ownerStep2, (txDCFs) => {
                            return _.last(txDCFs).walletOwner;
                        });

                        // Deposit Report Data
                        if (walletBalances.slice(1).length > 0) {
                            depositData = _.forEach(walletBalances.slice(1), (wallet) => {
                                return [
                                    wallet.walletOwner = walletOwner[wallet.wallet],
                                    wallet.defaultRemain = (wallet.deposit >= 5 ? 5 : wallet.deposit),
                                    wallet.withdrawAmount = (wallet.deposit >= 5 ? wallet.deposit - 5 : 0)
                                ];
                            });
                        }

                        return depositData;
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            } catch (e) {
                throw new Meteor.Error(e.message);
            }
        },

        'withdrawOne.post'(requestData) {
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
                requestData.data.time = new Date().getTime();
                otxDCFs = new TxDCF(
                    requestData.data.wallet,
                    requestData.data.walletKey,
                    requestData.data.walletOwner,
                    requestData.data.amount,
                    requestData.data.month,
                    requestData.data.year,
                    requestData.data.type,
                    requestData.data.time);

                const txDCFs = [otxDCFs];
                const txDCFContent = txDCFs.map((txDCF) => {
                    return (
                        txDCF.wallet + txDCF.walletKey + txDCF.walletOwner +
                        txDCF.amount + txDCF.month + txDCF.year +
                        txDCF.type + txDCF.timestamp);
                })
                    .reduce((a, b) => a + b, '');
                const txId = CryptoJS.SHA256(txDCFContent).toString();
                const dataToSign = txId;
                const priKey = Meteor.user().profile.priKey;
                const EC = new ec('secp256k1');
                const key = EC.keyFromPrivate(priKey, 'hex');
                const signature = Array.from(key.sign(dataToSign).toDER(), (byte) => {
                    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
                }).join('');
                requestData.data.signature = signature;
                requestData.data.isApproved = true;

                result = HTTP.post(Meteor.settings.public.apiURL + '/confirmWithdrawBlock', requestData);
                if (result) {
                    return result;
                } else {
                    return null;
                }
            } catch (e) {
                throw new Meteor.Error(e, e.reason, e.details);
            }
        },

        'email.send'(receiver, subject, text) {
            Email.send({
                from: "noreply@dcfundapp.com",
                to: receiver,
                subject: subject,
                text: text
            });
        },
    });
}

class TxDCF {
    constructor(wallet, walletKey, walletOwner, amount, month, year, type, timestamp) {
        this.wallet = wallet;
        this.walletKey = walletKey;
        this.walletOwner = walletOwner;
        this.amount = amount;
        this.month = month;
        this.year = year;
        this.type = type;
        this.timestamp = timestamp;
    }
}
