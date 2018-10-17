import React, {Component} from 'react';
import {Button, Grid, Segment, Table} from "semantic-ui-react";


class AdminList extends Component {
    render() {
        return (
            <Segment>
                <h2>Admin list</h2>
                {this.props.adminList.length === 0 ? <h3>Add your first admin</h3> : this.renderListTable()}
            </Segment>
        )
    }

    renderListTable() {
        const {Header, Row, HeaderCell, Body} = Table;
        return (
            <Table>
                <Header>
                    <Row>
                        <HeaderCell>ID</HeaderCell>
                        <HeaderCell>Name</HeaderCell>
                        <HeaderCell>Address</HeaderCell>
                        <HeaderCell>Actions</HeaderCell>
                    </Row>
                </Header>
                <Body>
                {this.renderRow()}
                </Body>
            </Table>
        );
    }

    /**
     * Render an admin as table row
     */
    renderRow() {
        const {Row, Cell} = Table;
        return this.props.adminList.map((item, index) => {
            return <Row key={index}>
                <Cell>{item.id}</Cell>
                <Cell>{item.name}</Cell>
                <Cell>{item.addr}</Cell>
                <Cell>
                    <Button.Group>
                        <Button size='small' compact onClick={() => this.props.onEditAdmin(item.addr, item.name)} color="teal">Edit</Button>
                        <Button size='small' compact onClick={() => this.props.onRemoveAdmin(item.addr)} color="red">Remove</Button>
                    </Button.Group>
                </Cell>
            </Row>
        });
    }
}


export default AdminList;