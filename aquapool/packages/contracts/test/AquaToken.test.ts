import { expect } from 'chai';
import { ethers } from 'hardhat';
import { AquaToken } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('AquaToken', () => {
  let token: AquaToken;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async () => {
    [owner, minter, user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('AquaToken');
    token = await Factory.deploy(owner.address) as AquaToken;
  });

  describe('Deployment', () => {
    it('sets the correct name and symbol', async () => {
      expect(await token.name()).to.equal('AquaToken');
      expect(await token.symbol()).to.equal('AQUA');
    });

    it('mints 10% of max supply to owner on deploy', async () => {
      const balance = await token.balanceOf(owner.address);
      expect(balance).to.equal(ethers.parseEther('100000000'));
    });

    it('sets MAX_SUPPLY to 1 billion', async () => {
      expect(await token.MAX_SUPPLY()).to.equal(ethers.parseEther('1000000000'));
    });
  });

  describe('Minting', () => {
    it('owner can mint tokens', async () => {
      await token.mint(user.address, ethers.parseEther('1000'));
      expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther('1000'));
    });

    it('approved minter can mint tokens', async () => {
      await token.addMinter(minter.address);
      await token.connect(minter).mint(user.address, ethers.parseEther('500'));
      expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther('500'));
    });

    it('reverts when non-minter tries to mint', async () => {
      await expect(token.connect(user).mint(user.address, ethers.parseEther('100')))
        .to.be.revertedWith('AquaToken: caller is not a minter');
    });

    it('reverts when minting would exceed max supply', async () => {
      await expect(token.mint(user.address, ethers.parseEther('900000001')))
        .to.be.revertedWith('AquaToken: max supply exceeded');
    });
  });

  describe('Access Control', () => {
    it('owner can add and remove minters', async () => {
      await token.addMinter(minter.address);
      expect(await token.minters(minter.address)).to.be.true;

      await token.removeMinter(minter.address);
      expect(await token.minters(minter.address)).to.be.false;
    });

    it('non-owner cannot add minters', async () => {
      await expect(token.connect(user).addMinter(minter.address))
        .to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount');
    });
  });

  describe('Burn', () => {
    it('token holder can burn their tokens', async () => {
      await token.mint(user.address, ethers.parseEther('1000'));
      await token.connect(user).burn(ethers.parseEther('500'));
      expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther('500'));
    });
  });
});
