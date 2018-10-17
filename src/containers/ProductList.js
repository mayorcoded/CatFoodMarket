import React, {Component} from 'react';
import {Button, Card, Image, Icon, Segment, Header, Statistic, Container} from 'semantic-ui-react'
import web3 from "../web3";
import marketplace from "../Marketplace";
import {productInfoTransformer} from "../utils";
import eventMamager from "../EventManager"
import Web3 from "web3";
import {connect} from "react-redux";

const web3Utils = Web3.utils;

window.localWeb3 = web3;

class ProductList extends Component {
    state = {
        account: '0x0',
        marketplaceInstance: null,
        errorMessage: '',
        productList: []
    };

    async componentDidMount() {

        let accounts = await web3.eth.getAccounts();
        let marketplaceInstance = await marketplace.deployed();

        this.setState({
            account: accounts[0],
            marketplaceInstance: marketplaceInstance,
        });

        this.createList();

        if (this.props.metamask) {
            this.addEventListeners();
        }
    }

    render() {
        return (
            <div>
                <Header as='h1'>CatFoods Products</Header>
                <Card.Group itemsPerRow={4}>
                    {
                        this.state.productList.length === 0
                            ? <Container>
                                <Segment>
                                    {this.props.loading ? 'Loading products ...' : 'There is not any product.'}
                                </Segment>
                            </Container>
                            : this.renderList()
                    }
                </Card.Group>
            </div>
        );
    }

    renderList() {
        return (
            this.state.productList.map((item, index) => {
                let stockCard = `${item.quantity} stock`;
                return (<Card key={index}>

                    <Image
                        label={{color: 'teal', content: stockCard, icon: 'paw', size: 'medium', ribbon: true}}
                        src={`https://ipfs.io/ipfs/${item.imageHash}`} fluid
                    />
                    <Card.Content>
                        <Card.Header>{item.name}</Card.Header>
                    </Card.Content>
                    <Card.Content extra>
                        <Statistic size='tiny' horizontal>
                            <Statistic.Value>{web3Utils.fromWei(item.price.toString(), "ether")}</Statistic.Value>
                            <Statistic.Label>Ether</Statistic.Label>
                        </Statistic>

                        <Button
                            primary
                            disabled={item.quantity < 1 || this.props.metamask === false}
                            floated="right"
                            onClick={this.purchaseProduct.bind(this, item.id, item.price)}
                        >
                            <Icon name='paw'/> Buy!
                        </Button>
                    </Card.Content>
                </Card>)
            })
        );
    }

    async createList() {

        this.props.dispatch({
            type: 'ENABLE_LOADING'
        });

        let productIds = await this.state.marketplaceInstance.getProductIndexes();

        let products = [];
        await Promise.all(
            productIds.map((id) => {
                return this.state.marketplaceInstance.getProduct(parseInt(id))
            })
        ).then((result) => {
            products = productInfoTransformer(result);
        });

        this.setState({
            productList: products,
        });

        this.props.dispatch({
            type: 'DISABLE_LOADING'
        });
    }

    async purchaseProduct(productId, productPrice) {
        try {

            this.props.dispatch({
                type: 'ENABLE_LOADING',
            });

            await this.state.marketplaceInstance.purchaseProduct(productId, {
                from: this.state.account,
                value: productPrice,
            });
        } catch (err) {
            this.props.dispatch({
                type: 'DISABLE_LOADING_WITH_MESSAGE',
                payload: {
                    content: err.message
                }
            });
        }
    }

    /**
     * !why this event fire always
     */
    addEventListeners() {
        this.state.marketplaceInstance.ProductPurchased({}, {toBlock: 'latest'})
            .watch((error, result) => {
                if (error) {
                    console.log(error);
                }

                if (eventMamager.isCurrentEvent(result.event, result.blockNumber)) {
                    // this.createList();
                    // this.props.dispatch({
                    //     type: 'DISABLE_LOADING',
                    // });
                }


                this.createList();
                // this.props.dispatch({
                //     type: 'DISABLE_LOADING',
                // });
                console.log("event fired")
            });
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        loading: state.loading,
        metamask: state.metamask,
    }
};

export default connect(mapStateToProps)(ProductList);
// export default ProductList;
