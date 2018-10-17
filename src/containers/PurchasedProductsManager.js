import React, {Component} from 'react';
import {Table, Message, Icon} from "semantic-ui-react";
import web3 from "../web3";
import marketplace from "../Marketplace";
import {purchasedProductInfoTransformer, loadingTemplate} from "../utils";
import Web3 from "web3";
import {connect} from 'react-redux';

const web3Utils = Web3.utils;

class PurchasedProductsManager extends Component {

    constructor(props) {
        super(props);
        this.state = {
            account: '0x0',
            marketplaceInstance: null,
            productList: [],
            errorMessage: '',
            loading: true,
        };
    }

    async componentDidMount() {
        let accounts = await web3.eth.getAccounts();
        let marketplaceInstance = await marketplace.deployed();

        window.marketPlace = marketplaceInstance;

        this.setState({
            account: accounts[0],
            marketplaceInstance: marketplaceInstance,
        });

        this.createList();
    }

    async createList() {
        this.props.dispatch({
            type: 'ENABLE_LOADING'
        });

        let products = [];

        try {
            let purchasedProductsCount = await this.state.marketplaceInstance.getPurchasedProductCount({from: this.state.account});

            await Promise.all(
                web3.utils._.range(0, parseInt(purchasedProductsCount)).map((index) => {
                    return this.state.marketplaceInstance.getPurchasedProduct(index, {from: this.state.account})
                })
            ).then((result) => {
                products = purchasedProductInfoTransformer(result);
            });

        } catch (err) {
            this.props.dispatch({
                type: 'DISABLE_LOADING_WITH_MESSAGE',
                payload: {
                    content: err.message
                }
            })
        }

        this.setState({
            productList: products,
        });

        this.props.dispatch({
            type: 'DISABLE_LOADING'
        });
    }

    render() {
        return (
            this.props.loading
                ? <div>Loading</div>
                : this.renderListTable()
        );
    }

    renderListTable() {
        if (this.state.productList.length === 0) {
            return <h1>There isn't any purchased product.</h1>
        }

        const {Header, Row, HeaderCell, Body} = Table;
        return (
            <div>
                <Table>
                    <Header>
                        <Row>
                            <HeaderCell>ID</HeaderCell>
                            <HeaderCell>Name</HeaderCell>
                            <HeaderCell>Price</HeaderCell>
                            <HeaderCell>Thumbnail</HeaderCell>
                        </Row>
                    </Header>
                    <Body>
                    {this.renderRow()}
                    </Body>
                </Table>
                <Message icon>
                    <Icon name='info'/>
                    <Message.Content>
                        <Message.Header>About this page</Message.Header>
                        In this page, you can see your purchased product you have. "Price" column doesn't show current price of the product.
                    </Message.Content>
                </Message>
            </div>
        );
    }

    renderRow() {
        const {Row, Cell} = Table;
        return this.state.productList.map((item, index) => {
            return (
                <Row key={index}>
                    <Cell>{item.id}</Cell>
                    <Cell>{item.name}</Cell>
                    <Cell>{web3Utils.fromWei(item.price.toString(), "ether")} ether</Cell>
                    <Cell><img width="100" src={`https://ipfs.io/ipfs/${item.imageHash}`}/></Cell>
                </Row>
            );
        });
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        loading: state.loading
    }
};

export default connect(mapStateToProps)(PurchasedProductsManager);

// export default PurchasedProductsManager;
