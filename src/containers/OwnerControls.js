import React, {Component} from 'react';
import web3 from "../web3";
import marketplace from "../Marketplace";
import {Button, Card, Header, List} from 'semantic-ui-react';
import {connect} from 'react-redux';

class OwnerControls extends Component {

    constructor(props) {
        super(props);
        this.state = {
            errorMessage: '',
            account: '0x0',
            marketplaceInstance: null,
        };
    }

    async componentDidMount() {
        let accounts = await web3.eth.getAccounts();
        let marketplaceInstance = await marketplace.deployed();

        this.setState({
            account: accounts[0],
            marketplaceInstance: marketplaceInstance,
        });

        this.prepareControls();
        this.addEventListeners();
    }

    /**
     * Main render method
     * @returns {*}
     */
    render() {
        return (
            <div>
                <Header as="h1">Owner Functions</Header>
                <Card.Group itemsPerRow={2}>
                    <Card>
                        <Card.Content>
                            <Card.Header>Paused / Emergency Stop Mode</Card.Header>
                            <Card.Description>
                                This function enable / disable most features in CatFoods.
                                <br/>
                                <h4> These functions are disabled when CatFoods is in 'paused' mode.</h4>
                                <List divided relaxed>
                                    <List.Item>creating a store owner</List.Item>
                                    <List.Item>removing an exist store owner</List.Item>
                                    <List.Item>winthdrawing for store owners</List.Item>
                                    <List.Item>adding a new product</List.Item>
                                    <List.Item>removing a exist product</List.Item>
                                    <List.Item>update a product</List.Item>
                                    <List.Item>purchasing a product by a shopper</List.Item>
                                    <List.Item>creating an admin</List.Item>
                                    <List.Item>removing an admin</List.Item>
                                </List>
                            </Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                            {
                                this.state.pausedStatus
                                    ? <Button color="green" fluid onClick={this.disablePausing.bind(this)}>Unpaused CatFoods</Button>
                                    : <Button color="yellow" fluid onClick={this.enablePausing.bind(this)}>Pause CatFoods</Button>
                            }
                        </Card.Content>
                    </Card>
                    <Card>
                        <Card.Content>
                            <Card.Header>Kill / Destruct Contract</Card.Header>
                            <Card.Description>
                                This function is including the ability to destroy the contract and remove it from the blockchain.
                                As an irreversible action, restricting access to this function is important.
                                CatFoods owner will receive all of the funds that the contract currently holds.
                                <br/>
                                This function is tested and working fine, but it has been disabled for security reasons.
                            </Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                            <Button color="red" fluid disabled onClick={this.destructContract.bind(this)}>Destruct Contract</Button>
                        </Card.Content>
                    </Card>
                </Card.Group>
            </div>
        );
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async destructContract() {
        alert("This function is tested and working fine, but it has been disabled for security reasons.");

        // await this.state.marketplaceInstance.destroy({
        //     from: this.state.account,
        //     gas: 2100000
        // });
    }

    /**
     * Pause handler
     */
    async disablePausing() {
        if (!confirm("Are you sure you want to activate most of functions of this Catfoods?")) {
            return;
        }

        this.props.dispatch({
            type: 'ENABLE_LOADING'
        });
        await this.state.marketplaceInstance.unpause({
            from: this.state.account
        });
    }

    /**
     * Unpause handler
     */
    async enablePausing() {
        if (!confirm("Are you sure you want to temporarily pause most of functions of this Catfoods?")) {
            return;
        }

        this.props.dispatch({
            type: 'ENABLE_LOADING'
        });
        await this.state.marketplaceInstance.pause({
            from: this.state.account
        });
    }

    async prepareControls() {
        this.props.dispatch({
            type: 'ENABLE_LOADING',
        });

        try {
            let pausedStatus = await this.state.marketplaceInstance.paused({from: this.state.account});
            this.setState({
                pausedStatus: pausedStatus,
            });
            this.props.dispatch({
                type: 'DISABLE_LOADING',
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

    afterUpdate(error, result) {
        if (error) {
            console.log("error shown");
        }

        this.props.dispatch({
            type: 'DISABLE_LOADING'
        });

        // eventten sonra tetiklenecek
        this.prepareControls();
    }

    addEventListeners() {
        this.state.marketplaceInstance.Pause().watch(this.afterUpdate.bind(this));
        this.state.marketplaceInstance.Unpause().watch(this.afterUpdate.bind(this));
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        loading: state.loading
    }
};

export default connect(mapStateToProps)(OwnerControls);
