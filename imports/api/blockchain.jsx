import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {HTTP} from 'meteor/http';
import {check} from 'meteor/check';
import * as _ from 'lodash';

if (Meteor.isServer) {
    // This code only runs on the server
    // Only publish tasks that are public or belong to the current user
}

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

    'balance.get'() {
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
            if (_.indexOf(Meteor.user().roles, "approver") >= 0) {
                // Approver
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
                result = HTTP.get(Meteor.settings.public.apiURL + '/balance/' + Meteor.user().profile.address);
                if (result) {
                    balances.myBalance = result.data;
                    if (!balances.myBalance) {
                        balances.myBalance = {
                            "wallet": Meteor.user().profile.address,
                            "deposit": 0,
                            "lend": 0
                        }
                    }
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
            const result = HTTP.post(Meteor.settings.public.apiURL + '/sendTransaction', requestData);
            if (result) {
                try {
                    Email.send({
                        from: "noreply@dcfundapp.com",
                        to: "anhtuan.hoangvu@gmail.com",
                        subject: "[DCFund] Approve new request",
                        text: "You have new request needs approval"
                    });
                } catch (e) {
                    console.log(e);
                }

                return result;
            } else {
                return null;
            }
        } catch (e) {
            throw new Meteor.Error(e.message);
        }
    },

    'removeRequest.post'(requestData) {
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

    'confirmRequest.post'(requestData) {
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
                        depositReportData: null
                    };
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
                            const dueDate = new Date(lastBorrowDate.getFullYear(), lastBorrowDate.getMonth() + 1, 0);

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

    'email.send'(receiver, subject, text) {
        Email.send({
            from: "noreply@dcfundapp.com",
            to: receiver,
            subject: subject,
            text: text
        });
    }
});
