require('dotenv').config()
const { ethers } = require("ethers")
const later = require('later')
const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org')
const targetAddr = process.env.TARGET
const prvKey = process.env.PRIVATE

const round = (num, d) => {
    const [ nat, dec ] = num.toString().split('.')
    if (!dec) return Number(nat)
    return Number(nat + '.' + dec.slice(0, d))
}

const signer = (private) => {
    return new ethers.Wallet(private, provider)
}

const send = async (private, receiver, value) => {
    const tx = await signer(private).sendTransaction({
        to: receiver,
        value: ethers.utils.parseEther(`${value}`)
    })
    console.log(tx.hash)
    return tx.hash
}

const balance = async (addr) => {
    const bal = await provider.getBalance(addr) / 10**18
    return round(bal, 8)
}

const forward = async () => {
    const _b = await balance(targetAddr)
    if ( _b > process.env.MIN ) return
    await send(prvKey, targetAddr, process.env.VAL)
}

later.setInterval(forward, later.parse.text('every 10 min'))