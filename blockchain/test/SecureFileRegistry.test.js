const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecureFileRegistry Contract", function () {
  let registry;

  beforeEach(async function () {
    const SecureFileRegistry = await ethers.getContractFactory("SecureFileRegistry");
    registry = await SecureFileRegistry.deploy();
    await registry.waitForDeployment();
  });

  it("Should register a file hash and emit FileRegistered event", async function () {
    const fileId = "test-file-123";
    const fileHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    await expect(registry.registerFile(fileId, fileHash))
      .to.emit(registry, "FileRegistered");

    const retrievedHash = await registry.getFileHash(fileId);
    expect(retrievedHash).to.equal(fileHash);
  });

  it("Should return true when verifying matching hash", async function () {
    const fileId = "doc-abc";
    const fileHash = "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";

    await registry.registerFile(fileId, fileHash);

    const isMatch = await registry.verifyFileHash(fileId, fileHash);
    expect(isMatch).to.be.true;

    const isDifferent = await registry.verifyFileHash(fileId, "tampered-hash-value-xyz");
    expect(isDifferent).to.be.false;
  });

  it("Should reject duplicate registration for the same fileId", async function () {
    const fileId = "file-once";
    const fileHash = "hash1";
    await registry.registerFile(fileId, fileHash);

    await expect(registry.registerFile(fileId, "hash2"))
      .to.be.revertedWith("File record already exists on blockchain");
  });
});
