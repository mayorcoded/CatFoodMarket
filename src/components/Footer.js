import React, {Component} from 'react';
import {Divider, Container, Icon, Message} from 'semantic-ui-react';
import {connect} from 'react-redux';

class Footer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showMessage: false
        }
    }

    componentDidMount() {
        setTimeout(function () {
            this.setState({
                showMessage: true
            })
        }.bind(this), 1000)
    }

    render() {
        return (
            <Container textAlign='center'>
                <Divider inverted section/>
                <Icon size='big' name='paw'/>
                {
                    this.state.showMessage ? this.footerMessage() : ''
                }
            </Container>
        )
    }

    footerMessage() {
        if (this.props.metamask && !this.props.account) {
            return (
                <Message negative icon>
                    <Icon name='dont'/>
                    <Message.Content>
                        <Message.Header>Metamask is not accessible.</Message.Header>
                        Metamask extension is enabled but your account information can not be accessible.<br />
                        Make sure Metamask extension is not locked or the network is selected correctly .
                    </Message.Content>
                </Message>
            )
        }

        if (!this.props.metamask) {
            return (
                <Message negative icon>
                    <Icon name='dont'/>
                    <Message.Content>
                        <Message.Header>Metamask is not installed.</Message.Header>
                        If you want to use all features of this website you have to install Metamask Extension.
                        <br/>
                        Please visit <a target="_blank" href="https://metamask.io/">https://metamask.io/</a> to have more information.
                    </Message.Content>
                </Message>
            )
        }

        const {roleHelper} = this.props;

        if (roleHelper == null) {
            return '';
        }

        return (
            <div style={{padding: 10}}>
                Your Address: {this.props.account}
                <br/>{roleHelper.getMessage()}
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        metamask: state.metamask
    }
};

export default connect(mapStateToProps)(Footer);
