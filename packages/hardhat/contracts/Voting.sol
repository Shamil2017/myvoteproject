// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract Voting {
    struct Option {
        string name;
        uint256 voteCount;
    }

    string public question;

    Option[] public options;

    mapping(address => bool) public hasVoted;

    constructor(
        string memory _question,
        string[] memory _optionNames
    ) {
        question = _question;

        for (uint256 i = 0; i < _optionNames.length; i++) {
            options.push(
                Option({
                    name: _optionNames[i],
                    voteCount: 0
                })
            );
        }
    }

    function vote(uint256 _optionIndex) public {
        require(
            !hasVoted[msg.sender],
            "You have already voted"
        );

        require(
            _optionIndex < options.length,
            "Invalid option"
        );

        hasVoted[msg.sender] = true;

        options[_optionIndex].voteCount += 1;
    }
    function getOptionsCount() public view returns (uint256) {
        return options.length;
    }

}