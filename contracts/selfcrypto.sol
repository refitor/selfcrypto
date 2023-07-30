//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// @title The selfweb3 contract is used to provide decentralized key management services.
// @author refitor
contract selfweb3 is Ownable {
    using ECDSA for bytes32;
    using SafeMath for uint256;
    using Address for address payable;
    struct MetaData {
        address wallet;
        uint256 feeRate;
        uint256 registTotal;
    }
    struct StoreData {
        bytes recoverID;
        bytes web3Key;
        bytes backendKey;
        bytes web3PublicKey;
    }
    MetaData private _metaData;
    mapping (address => StoreData) private _dataMap;

    /**
     * @dev constructor is used to populate the meta information of the contract.
     * @param wallet the wallet address specified by the creator.
     * @param feeRate fee deduction percentage set by the contract creator, demo: 500 / 10000, feeRate is 500.
     */
    constructor(address wallet, uint256 feeRate) {
        _metaData = MetaData(wallet, 0, 0);
        _metaData.feeRate = feeRate;
    }

    /**
     * @dev Register is used to register the web3 user.
     * @param recoverID recovery ID specified by the user.
     * @param web3Key web3 key specified by the front end.
     * @param backendKey backend key specified by the back end.
     * @param web3PublicKey web3 public key specified by the back end.
     */
    function Register(bytes calldata recoverID, bytes calldata web3Key, bytes calldata backendKey, bytes calldata web3PublicKey) external payable {
        StoreData memory sd = _getKV(msg.sender);
        require(sd.web3Key.length == 0, "duplicate registration");
        require(web3Key.length != 0, "web3Key must be non-empty");
        require(recoverID.length != 0, "recoverID must be non-empty");
        require(backendKey.length != 0, "backendKey must be non-empty");
        require(web3PublicKey.length != 0, "web3PublicKey must be non-empty");
        sd = StoreData(recoverID, web3Key, backendKey, web3PublicKey);
        _setKV(msg.sender, sd, 1);
    }

    /**
     * @dev Recover is used to recover the web3 user.
     * @param signature signature signed by the web3 user.
     * @param message random string dynamically generated by the front end.
     * @param web3PublicKey web3 public key specified by the back end.
     */
    function Recover(bytes calldata signature, bytes calldata message, bytes calldata web3PublicKey) external payable {
        require(_verify(signature, message) == msg.sender, "permission denied");
        require(web3PublicKey.length != 0, "web3PublicKey must be non-empty");
        StoreData memory sd = _getKV(msg.sender);
        sd = StoreData(sd.recoverID, sd.web3Key, sd.backendKey, web3PublicKey);
        _setKV(msg.sender, sd, 0);
    }

    /**
     * @dev Load is used to load the key information.
     * @param signature signature signed by the web3 user.
     * @param message random string dynamically generated by the front end.
     */
    function Load(bytes calldata signature, bytes calldata message) view external returns (bytes memory recoverID, bytes memory web3Key, bytes memory backendKey, bytes memory web3PublicKey) {
        require(_verify(signature, message) == msg.sender, "permission denied");
        StoreData memory sd = _getKV(msg.sender);
        require(sd.web3Key.length != 0, "not registered yet");
        return (sd.recoverID, sd.web3Key, sd.backendKey, sd.web3PublicKey);
    }

    /**
     * @dev Meta is used to load the meta information of the contract.
     */
    function Meta() view external returns (uint256 feeRate, uint256 registTotal) {
        MetaData memory md = _get();
        return (md.feeRate, md.registTotal);
    }

    /**
     * @dev _verify is used to verify the signature.
     * @param signature signature signed by the web3 user.
     * @param message random string dynamically generated by the front end.
     */
    function _verify(bytes calldata signature, bytes calldata message) private pure returns (address) {
        // need to hardcode exactly how the types in the signTypedData are
        bytes32 typeHash = keccak256(abi.encodePacked('string Message'));
        bytes32 valueHash = keccak256(abi.encodePacked(message));
        return keccak256(abi.encodePacked(typeHash, valueHash)).recover(signature);
    }

    /**
     * @dev _setKV is used to set dataMap.
     * @param k the key for _datamap.
     * @param v the value for _datamap.
     */
    function _setKV(address k, StoreData memory v, uint256 count) private {
        _dataMap[k] = v;
        _metaData.registTotal = _metaData.registTotal + count;
    }

    /**
     * @dev _getKV is used to get the value by the key.
     * @param k the key for _datamap.
     */
    function _getKV(address k) private view  returns (StoreData memory sd) {
        return _dataMap[k];
    }

    /**
     * @dev _get is used to load the meta information of the contract.
     */
    function _get() private view returns (MetaData memory md) {
        return _metaData;
    }
}