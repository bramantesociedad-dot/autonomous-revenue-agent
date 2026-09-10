// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract RevenueGateway is Ownable {
    using SafeERC20 for IERC20;

    struct Product { uint256 price; bool active; }

    IERC20 public immutable usdc;
    address public treasury;
    address public operator;
    uint16 public reinvestBps;
    uint16 public constant MAX_REINVEST_BPS = 3000;

    mapping(bytes32 => Product) public products;
    mapping(bytes32 => bool) public paidOrders;
    mapping(bytes32 => bytes32) public orderProduct;

    event ProductSet(bytes32 indexed productId, uint256 price, bool active);
    event PaymentReceived(bytes32 indexed orderId, bytes32 indexed productId, address indexed payer, uint256 grossAmount, uint256 agentAmount, uint256 treasuryAmount);
    event OperatorChanged(address indexed operator);
    event TreasuryChanged(address indexed treasury);
    event ReinvestBpsChanged(uint16 bps);

    modifier onlyOperatorOrOwner() {
        require(msg.sender == operator || msg.sender == owner(), "not operator");
        _;
    }

    constructor(address usdc_, address treasury_, address operator_, address owner_, uint16 reinvestBps_) Ownable(owner_) {
        require(usdc_ != address(0), "bad usdc");
        require(treasury_ != address(0), "bad treasury");
        require(operator_ != address(0), "bad operator");
        require(owner_ != address(0), "bad owner");
        require(reinvestBps_ <= MAX_REINVEST_BPS, "reinvest too high");
        usdc = IERC20(usdc_);
        treasury = treasury_;
        operator = operator_;
        reinvestBps = reinvestBps_;
    }

    function setProduct(bytes32 productId, uint256 price, bool active) external onlyOperatorOrOwner {
        require(price > 0, "price=0");
        products[productId] = Product(price, active);
        emit ProductSet(productId, price, active);
    }

    function pay(bytes32 productId, bytes32 orderId) external {
        Product memory p = products[productId];
        require(p.active, "inactive product");
        require(!paidOrders[orderId], "order already paid");
        paidOrders[orderId] = true;
        orderProduct[orderId] = productId;
        uint256 agentAmount = (p.price * reinvestBps) / 10_000;
        uint256 treasuryAmount = p.price - agentAmount;
        if (agentAmount > 0) usdc.safeTransferFrom(msg.sender, operator, agentAmount);
        usdc.safeTransferFrom(msg.sender, treasury, treasuryAmount);
        emit PaymentReceived(orderId, productId, msg.sender, p.price, agentAmount, treasuryAmount);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "bad treasury");
        treasury = newTreasury;
        emit TreasuryChanged(newTreasury);
    }
    function setOperator(address newOperator) external onlyOwner {
        require(newOperator != address(0), "bad operator");
        operator = newOperator;
        emit OperatorChanged(newOperator);
    }
    function setReinvestBps(uint16 newBps) external onlyOwner {
        require(newBps <= MAX_REINVEST_BPS, "reinvest too high");
        reinvestBps = newBps;
        emit ReinvestBpsChanged(newBps);
    }
}
