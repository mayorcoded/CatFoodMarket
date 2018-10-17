import Web3 from 'web3';
import IPFS from "./ipfs";
import React from 'react';
import {Dimmer, Image, Loader, Segment, Message} from "semantic-ui-react";

let _ = Web3.utils._;

/**
 * @param userInfos
 * @returns {Array}
 */
export function userInfoConvertor(userInfos) {
    let infoSize = userInfos[0].length;
    let summaryInfo = [];

    _.range(infoSize).forEach(function (value, key) {
        summaryInfo.push({
            addr: userInfos[0][key],
            id: parseInt(userInfos[1][key]),
            name: Web3.utils.toUtf8(userInfos[2][key]),
        })
    });

    return summaryInfo;
}

/**
 * @param productInfos
 * @returns {Array}
 * @deprecated Solidity has to many limitations. Storage greater than 32 character in bytes32 can't be possible. String type can't be retrived inside array;
 */
export function productInfoConvertor(productInfos) {
    let infoSize = productInfos[0].length;
    let summaryInfo = [];

    _.range(infoSize).forEach(function (value, key) {
        summaryInfo.push({
            id: productInfos[0][key].toNumber(),
            name: Web3.utils.toUtf8(productInfos[1][key]),
            price: productInfos[2][key].toNumber(),
            quantity: productInfos[3][key].toNumber(),
        })
    });

    return summaryInfo;
}

export function productInfoTransformer(products) {
    return products.map((product, index) => {
        return {
            id: product[0].toNumber(),
            name: product[1].toString(),
            price: product[2].toNumber(),
            quantity: product[3].toNumber(),
            imageHash: product[4].toString()
        }
    });
}

export function purchasedProductInfoTransformer(products) {
    return products.map((product, index) => {
        return {
            id: product[0].toNumber(),
            name: product[1].toString(),
            price: product[2].toNumber(),
            imageHash: product[3].toString()
        }
    });
}

export function loadingTemplate() {
    return (
        <Segment>
            <Dimmer active inverted>
                <Loader inverted>progressing</Loader>
            </Dimmer>
            <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png'/>
        </Segment>
    );
}

/**
 * @param inputFile
 * @returns {Promise<any>}
 */
export function readAsArrayBuffer(inputFile) {
    const fileReader = new window.FileReader();
    return new Promise((resolve, reject) => {
        fileReader.onerror = () => {
            fileReader.abort();
            reject(new DOMException("Problem parsing input file."));
        };
        fileReader.onloadend = () => {
            resolve(fileReader.result);
        };
        fileReader.readAsArrayBuffer(inputFile);
    });
}

/**
 * !Hata kontrolleri yapılacak.
 * @param inputFile
 * @returns {Promise<void>}
 */
export async function uploadToIPFS(inputFile) {
    const result = await readAsArrayBuffer(inputFile);
    const buffer = Buffer.from(result);
    return IPFS.add(buffer, {progress: (prog) => console.log(`received: ${prog}`)});
}

export function errorMessageTemplate(validationErrors) {
    return (
        <ul>
            {validationErrors.map((item, key) => {
                return <li key={key}>{item}</li>;
            })}
        </ul>
    );
}

export function messageTemplate(header = "error", content = false) {
    return <Message
        success
        header={header}
        content={content}
    />;
}

/**
 *
 * @param permissions [is super admin (owner), is admin, is store owner, is customer]
 */
export function roleMessages(permissions) {
    const rolesDescription = [
        'You have Market Place Owner. ',
        'You have Market Place Admin. ',
        'You have Store Owner permission. ',
        'You are a website visitor. '
    ];

    let messages = [];

    permissions.forEach((permission, index) => {
        if (permission) {
            messages.push(rolesDescription[index]);
        }
    });

    return messages;
}

