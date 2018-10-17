import React, {Component} from 'react';
import web3 from "../web3";
import marketplace from "../Marketplace";
import Web3 from 'web3';
import {errorMessageTemplate, productInfoTransformer, uploadToIPFS} from '../utils';
import {List, Button, Grid, Table, Form, Input, Message, Segment, Icon, Confirm, Header} from 'semantic-ui-react';
import {connect} from 'react-redux';

const web3Utils = Web3.utils;

class StoreOwnerDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMessage: '',
            account: '0x0',
            marketplaceInstance: null,
            loading: false,
            loadingWithdraw: false,
            marketplaceBalance: 0,
            productList: [],
            modalStatus: false,
            storageOwnerInfo: {
                name: '',
                address: '',
                balance: '',
            },
            productFormInput: {
                productName: '',
                productQuantity: 1,
                productThumbnail: null,
                productPrice: 10,
                file: null,
                formType: '',
                productId: null,
            },
            productFormInputDefault: {
                productName: '',
                productQuantity: 1,
                productThumbnail: null,
                productPrice: 0,
                file: null,
                formType: '',
                productId: null
            },
        };
    }

    async componentDidMount() {
        let accounts = await web3.eth.getAccounts();
        let marketplaceInstance = await marketplace.deployed();

        this.setState({
            account: accounts[0],
            marketplaceInstance: marketplaceInstance,
        });

        this.addEventListeners();
        this.prepareDashboard();
    }

    /**
     * Main render method
     * @returns {*}
     */
    render() {
        return (
            <div>
                <Header as='h1'>Your Storage Owner Dashboard</Header>
                <Grid stackable columns={2}>
                    <Grid.Column width={10}>
                        <Segment>
                            <h2>
                                Your Products in Sell
                                <Button
                                    floated='right'
                                    size='tiny'
                                    color="green"
                                    onClick={() => {
                                        this.setState({
                                            productFormInput: {...this.state.productFormInputDefault, formType: 'newProduct'}
                                        });
                                    }}>
                                    <Icon name='add'/>
                                    Add a new Product
                                </Button>
                            </h2>
                            {this.renderProducts()}
                        </Segment>
                    </Grid.Column>
                    <Grid.Column width={6}>
                        {this.state.productFormInput.formType === 'newProduct' ? this.showAddProductForm() : ''}
                        {this.state.productFormInput.formType === 'editProduct' ? this.showEditProductForm() : ''}
                        <Segment>
                            {this.renderSummary()}
                        </Segment>
                    </Grid.Column>
                </Grid>
                <Message icon>
                    <Icon name='info'/>
                    <Message.Content>
                        <Message.Header>About this page</Message.Header>
                        In this page, a store owner can manage own products and see own account summary.<br/>
                        <Message.List>
                            <Message.Item>Press <Button size='mini' color="green"><Icon name='add'/> Add a new Product</Button> button to show a new product form.</Message.Item>
                            <Message.Item>Press <Button size='mini' color="teal">Edit</Button> button to show edit product form.</Message.Item>
                            <Message.Item>Press <Button size='mini' color="red">Remove</Button> button to remove the related product.</Message.Item>
                            <Message.Item>Press <Button primary size='mini'><Icon name="arrow alternate circle down"/> Withdraw</Button> button to withraw your balance in CatFoods.</Message.Item>
                        </Message.List>
                    </Message.Content>
                </Message>
            </div>
        )
    }

    renderSummary() {
        return (
            <div>
                <h2>Account Summary</h2>
                <List divided relaxed>
                    <List.Item>
                        <List.Icon name='address book' size='large' verticalAlign='middle'/>
                        <List.Content>
                            <List.Header>Your Marketplace name</List.Header>
                            <List.Description>{this.state.storageOwnerInfo.name}</List.Description>
                        </List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Icon name='barcode' size='large' verticalAlign='middle'/>
                        <List.Content>
                            <List.Header>Your Marketplace Address</List.Header>
                            <List.Description style={{wordBreak: 'break-all'}}>{this.state.storageOwnerInfo.address}</List.Description>
                        </List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Icon name='money bill alternate' size='large' verticalAlign='middle'/>
                        <List.Content>
                            <List.Header>Your Marketplace Balance</List.Header>
                            <List.Description>{web3Utils.fromWei(this.state.storageOwnerInfo.balance.toString(), "ether")} ether</List.Description>
                        </List.Content>
                    </List.Item>
                </List>
                <Button disabled={this.state.storageOwnerInfo.balance < 1 || this.state.loadingWithdraw} loading={this.state.loadingWithdraw} primary fluid onClick={this.onWithdraw.bind(this)}><Icon name="arrow alternate circle down"/>Withdraw</Button>
            </div>
        );
    }

    showEditProductForm() {
        return (
            <Segment>
                <h2>Edit Product</h2>
                <Form onSubmit={this.onEditProductFormSubmit.bind(this)}>
                    <Form.Field>
                        <Form.Field>
                            <label>Product Name</label>
                            <Input
                                value={this.state.productFormInput.productName}
                                onChange={event => this.setState({
                                    productFormInput: {...this.state.productFormInput, productName: event.target.value}
                                })}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>Product Price</label>
                            <Input
                                placeholder="0.01"
                                step="0.01"
                                required
                                min="0"
                                max="1"
                                type="number"
                                label="ether"
                                labelPosition="right"
                                value={this.state.productFormInput.productPrice}
                                onChange={event => this.setState({
                                    productFormInput: {...this.state.productFormInput, productPrice: event.target.value}
                                })}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>Product Quantity</label>
                            <Input
                                min="1"
                                max="100"
                                required
                                type="number"
                                placeholder="1"
                                value={this.state.productFormInput.productQuantity}
                                onChange={event => this.setState({
                                    productFormInput: {...this.state.productFormInput, productQuantity: event.target.value}
                                })}
                            />
                        </Form.Field>
                    </Form.Field>
                    <Button primary loading={this.props.loading}>Update!</Button>
                </Form>
            </Segment>
        );
    }

    showAddProductForm() {
        return (
            <Segment>
                <h2>New Product Form</h2>
                <Form onSubmit={this.onAddProductFormSubmit.bind(this)}>
                    <Form.Field>
                        <Form.Field>
                            <label>Product Name</label>
                            <Input
                                value={this.state.productFormInput.productName}
                                onChange={event => this.setState({
                                    productFormInput: {...this.state.productFormInput, productName: event.target.value}
                                })}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>Product Price</label>
                            <Input
                                placeholder="0.01"
                                step="0.01"
                                required
                                min="0"
                                max="1"
                                type="number"
                                label="ether"
                                labelPosition="right"
                                value={this.state.productFormInput.productPrice}
                                onChange={event => this.setState({
                                    productFormInput: {...this.state.productFormInput, productPrice: event.target.value}
                                })}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>Product Quantity</label>
                            <Input
                                min="1"
                                max="100"
                                required
                                type="number"
                                placeholder="1"
                                value={this.state.productFormInput.productQuantity}
                                onChange={event => this.setState({
                                    productFormInput: {...this.state.productFormInput, productQuantity: event.target.value}
                                })}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>Thumbnail</label>
                            <Input type="file" onChange={(event) => {
                                this.setState({
                                    productFormInput: {...this.state.productFormInput, file: event.target.files[0]}
                                });
                            }}/>
                        </Form.Field>
                    </Form.Field>
                    <Button primary loading={this.props.loading}>Create!</Button>
                </Form>
            </Segment>
        );
    }

    renderProducts() {
        if (this.state.productList.length === 0) {
            return <h3>Please add your first product.</h3>
        }
        const {Header, Row, HeaderCell, Body} = Table;
        return (
            <Table>
                <Header>
                    <Row>
                        <HeaderCell>ID</HeaderCell>
                        <HeaderCell>Name</HeaderCell>
                        <HeaderCell>Price (ether)</HeaderCell>
                        <HeaderCell>Quantity</HeaderCell>
                        <HeaderCell>Thumbnail</HeaderCell>
                        <HeaderCell>Action</HeaderCell>
                    </Row>
                </Header>
                <Body>
                {this.renderRow()}
                </Body>
            </Table>
        );
    }

    renderRow() {
        const {Row, Cell} = Table;
        return this.state.productList.map((item, index) => {
            return (
                <Row key={index}>
                    <Cell>{item.id}</Cell>
                    <Cell>{item.name}</Cell>
                    <Cell>{web3Utils.fromWei(item.price.toString(), "ether")}</Cell>
                    <Cell>{item.quantity}</Cell>
                    <Cell><img width="50" src={`https://ipfs.io/ipfs/${item.imageHash}`}/></Cell>
                    <Cell>
                        <Button.Group>
                            <Button size='small' compact onClick={() => this.onEditProduct(item.id)} color="teal">Edit</Button>
                            <Button size='small' compact onClick={() => this.removeProduct(item.id, item.name)} color="red">Remove</Button>
                        </Button.Group>
                    </Cell>
                </Row>
            );
        });
    }

    async onEditProduct(productId) {
        let productInfo = await this.state.marketplaceInstance.getProduct(productId);
        this.setState({
            productFormInput: {
                ...this.state.productFormInput,
                productName: productInfo[1],
                productPrice: web3Utils.fromWei(productInfo[2].toString(), "ether"),
                productQuantity: productInfo[3].toNumber(),
                formType: 'editProduct',
                productId: productInfo[0].toNumber()
            }
        })
    }

    async onWithdraw() {
        this.props.dispatch({
            type: 'ENABLE_LOADING',
        });

        this.setState({
            loadingWithdraw: true
        });

        try {
            await this.state.marketplaceInstance.withdraw({from: this.state.account, gas: 1000000});
        } catch (err) {

            this.setState({
                loadingWithdraw: false
            });

            this.props.dispatch({
                type: 'DISABLE_LOADING_WITH_MESSAGE',
                payload: {
                    content: err.message
                }
            });
        }
    }

    async prepareDashboard() {
        this.getSummary();
        this.getProducts();
    }

    async getSummary() {
        try {
            let result = await this.state.marketplaceInstance.getStoreOwnerInfo({from: this.state.account});

            this.setState({
                storageOwnerInfo: {
                    name: web3Utils.hexToUtf8(result[1]),
                    address: result[2],
                    balance: result[3].toNumber()
                },
            })
        } catch (e) {
            this.props.dispatch({
                type: 'DISABLE_LOADING_WITH_MESSAGE',
                payload: {
                    content: e.message
                }
            });
        }
    }

    async getProducts() {
        let productIds = await this.state.marketplaceInstance.getProductIndexesByStoreOwner(this.state.account);

        let filteredProductIds = productIds.filter((productId, index) => {
            return parseInt(productId) !== 0;
        });

        if (filteredProductIds.length === 0) {
            return;
        }

        let products = [];

        await Promise.all(
            filteredProductIds.map((id) => {
                return this.state.marketplaceInstance.getProduct(parseInt(id))
            })
        ).then((result) => {
            products = productInfoTransformer(result);
            this.setState({
                productList: products,
            });
        });
    }

    async onAddProductFormSubmit() {
        this.props.dispatch({
            type: 'ENABLE_LOADING',
        });

        let validationErrors = [];

        if (!this.state.productFormInput.file) {
            validationErrors.push('Please pick an image.');
        }

        if (!this.state.productFormInput.productName) {
            validationErrors.push('Please enter a product name');
        }

        if (this.state.productFormInput.productQuantity < 1 || this.state.productFormInput.productQuantity > 101) {
            validationErrors.push('Quantitiy must be bewtween 1 and 100');
        }

        if (this.state.productFormInput.productPrice < 0 || this.state.productFormInput.productPrice > 1) {
            validationErrors.push('Price must be between 0.1 and 1. Remember ETH is really big value');
        }

        if (validationErrors.length > 0) {
            this.props.dispatch({
                type: 'DISABLE_LOADING_WITH_MESSAGE',
                payload: {
                    content: errorMessageTemplate(validationErrors)
                }
            });
            return;
        }

        const {productName, productPrice, productQuantity} = this.state.productFormInput;
        const response = await uploadToIPFS(this.state.productFormInput.file);
        const ipfsFileHash = response[0].hash;

        try {
            await this.state.marketplaceInstance.addProduct(
                productName,
                web3Utils.toWei(productPrice, "ether"),
                productQuantity,
                ipfsFileHash,
                {
                    from: this.state.account,
                }
            );
        } catch (err) {
            this.props.dispatch({
                type: 'DISABLE_LOADING_WITH_MESSAGE',
                payload: {
                    content: err.message
                }
            });
        }
    }

    async onEditProductFormSubmit() {
        this.setState({
            errorMessage: ''
        });

        this.props.dispatch({
            type: 'ENABLE_LOADING',
        });

        let validationErrors = [];

        if (this.state.productFormInput.productId < 1) {
            validationErrors.push('Please enter a product id');
        }

        if (!this.state.productFormInput.productName) {
            validationErrors.push('Please enter a product name');
        }

        if (this.state.productFormInput.productQuantity < 1 || this.state.productFormInput.productQuantity > 101) {
            validationErrors.push('Quantitiy must be bewtween 1 and 100');
        }

        if (this.state.productFormInput.productPrice < 0 || this.state.productFormInput.productPrice > 1) {
            validationErrors.push('Price must be between 0.1 and 1. Remember ETH is really big value');
        }

        if (validationErrors.length > 0) {
            this.props.dispatch({
                type: 'DISABLE_LOADING_WITH_MESSAGE',
                payload: {
                    content: errorMessageTemplate(validationErrors)
                }
            });
            return;
        }

        const {productName, productPrice, productQuantity, productId} = this.state.productFormInput;

        try {
            await this.state.marketplaceInstance.updateProduct(productId,
                productName,
                web3.utils.toWei(productPrice, 'ether'),
                productQuantity,
                {
                    from: this.state.account,
                }
            );
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
     * Remove product handler
     * @param productId Product id
     * @param productName Product name
     */
    removeProduct(productId, productName) {
        if (!confirm("Are you sure you want to remove '" + productName + "' product?")) {
            return;
        }

        this.props.dispatch({
            type: 'ENABLE_LOADING',
        });

        this.state.marketplaceInstance.removeProduct(productId, {from: this.state.account, gas: 2100000});
    }

    addEventListeners() {
        this.state.marketplaceInstance.ProductAdded().watch(this.updateProductList.bind(this));
        this.state.marketplaceInstance.ProductUpdated().watch(this.updateProductList.bind(this));
        this.state.marketplaceInstance.ProductRemoved().watch(this.updateProductList.bind(this));
        this.state.marketplaceInstance.Withdrawn().watch(() => {
            this.props.dispatch({
                type: 'DISABLE_LOADING',
            });
            this.setState({
                loadingWithdraw: false
            });
            this.getSummary();
        });
    }

    updateProductList(error, result) {

        if (error) {
            console.log(error);
        }

        this.props.dispatch({
            type: 'DISABLE_LOADING'
        });

        this.setState({
            productFormInput: this.state.productFormInputDefault
        });

        //result.args
        // eventten sonra tetiklenecek
        this.getProducts();
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        loading: state.loading
    }
};

export default connect(mapStateToProps)(StoreOwnerDashboard);
