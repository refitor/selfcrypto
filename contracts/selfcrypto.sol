//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// @title The SelfData contract is used to implement decentralized encryption and decryption services.
// @author refitor
contract SelfData is Ownable {
    using ECDSA for bytes32;
    using SafeMath for uint256;
    using Address for address payable;
    struct MetaData {
        address wallet;
        address nftAddr;
        uint256 storeFee;
        uint256 feeRate;
        uint256 registTotal;
    }
    struct StoreData {
        bytes recoverID;
        bytes web3Key;
        bytes backendKey;
    }
    MetaData private _metaData;
    mapping (address => StoreData) private _dataMap;

    /**
     * @dev the contract is set up by the creator.
     * @param wallet wallet address specified by the creator.
     * @param nftAddr the NFT address specified by the creator.
     * @param storeFee one-time storage fee for registration.
     * @param feeRate fee deduction percentage set by the contract creator, demo: 500 / 10000, feeRate is 500.
     */
    function Reset(address wallet, address nftAddr, uint256 storeFee, uint256 feeRate) external onlyOwner {
        _set(wallet, nftAddr, storeFee, feeRate);
    }

    /**
     * @dev function for user registration.
     * @param recoverID recoverID encrypted by wallet and backend.
     * @param web3Key web3Key encrypted by wallet and backend.
     * @param backendKey backendKey encrypted by wallet and backend.
     */
    function Regist(bytes calldata recoverID, bytes calldata web3Key, bytes calldata backendKey) external payable {
        StoreData memory sd = _getKV(msg.sender);
        require(sd.web3Key.length == 0, "duplicate registration");
        require(web3Key.length != 0, "web3Key must be non-empty");
        require(recoverID.length != 0, "recoverID must be non-empty");
        require(backendKey.length != 0, "backendKey must be non-empty");
        MetaData memory md = _get();
        if (md.nftAddr != address(0)) {
            require(IERC721(md.nftAddr).balanceOf(msg.sender) != 0, "illegal nft holder");
        } else if (md.storeFee > 0 && md.feeRate > 0) {
            require(msg.value > 0, "store fee must be greater than 0");
            require(msg.value == md.storeFee, "invalid registration fee");
            require(msg.value * md.feeRate / 10000 > 0, "invalid registration fee");
            payable(md.wallet).sendValue(msg.value * md.feeRate / 10000);
        }
        sd = StoreData(recoverID, web3Key, backendKey);
        _setKV(msg.sender, sd);
    }

    /**
     * @dev function load encrypted data.
     * @param signature signature need verify.
     * @param message messages for signature verification.
     */
    function Load(bytes calldata signature, bytes calldata message) view external returns (bytes memory recoverID, bytes memory web3Key, bytes memory backendKey) {
        require(_verify(signature, message) == msg.sender, "permission denied");
        StoreData memory sd = _getKV(msg.sender);
        require(sd.web3Key.length != 0, "not registered yet");
        return (sd.recoverID, sd.web3Key, sd.backendKey);
    }

    /**
     * @dev function load register total.
     */
    function Total() view external returns (uint256 registTotal) {
        MetaData memory md = _get();
        return md.registTotal;
    }

    /**
     * @dev function verify signature.
     * @param signature signature need verify.
     * @param message message need verify.
     */
    function _verify(bytes calldata signature, bytes calldata message) private pure returns (address) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", message)).recover(signature);
    }

    /**
     * @dev function set for _dataMap.
     * @param k the key for _datamap.
     * @param v the value for _datamap.
     */
    function _setKV(address k, StoreData memory v) private {
        _dataMap[k] = v;
        _metaData.registTotal = _metaData.registTotal + 1;
    }

    /**
     * @dev function get for _dataMap.
     * @param k the key for _datamap.
     */
    function _getKV(address k) private view  returns (StoreData memory sd) {
        return _dataMap[k];
    }

    /**
     * @dev function set private variable.
     * @param wallet wallet address specified by the creator.
     * @param nftAddr the NFT address specified by the creator.
     * @param storeFee one-time storage fee for registration.
     * @param feeRate fee deduction percentage set by the contract creator, demo: 500 / 10000, feeRate is 500.
     */
    function _set(address wallet, address nftAddr, uint256 storeFee, uint256 feeRate) private {
        _metaData = MetaData(wallet, nftAddr, 0, 0, 0);
        if (nftAddr == address(0)) {
            _metaData.storeFee = storeFee;
            _metaData.feeRate = feeRate;
        }
    }

    /**
     * @dev function get private variable.
     */
    function _get() private view returns (MetaData memory md) {
        return _metaData;
    }
}