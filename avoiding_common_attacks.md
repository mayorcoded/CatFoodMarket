# Safety Checklist

## Logic Bugs

To get minimum bugs i have written unit tests for many scenarios. Unit testing is so helpfull. To measure the code coverage of tested codes i used solidity-coverage package (https://github.com/sc-forks/solidity-coverage) is suggested by Consensys (https://consensys.github.io/smart-contract-best-practices/security_tools/). The code coverage of CatFoods project is 99.03%. I run also tests on CI server provided by Bitbucket.

Coding standarts and best practices also import for me. I use solhint tools to check securty and style guide validation. The contracts are passed from the criterias fot this tools.

I also used smartdec tool (https://tool.smartdec.net/). The tools has a lots of criteria (realy) and also helpfull for studing.

CatFoods has a number of complex rules :( EVM has a alots of limitations especially types, and returning values. More practicing should be better for everyone.

## Integer Arithmetic Overflow

I used math/SafeMath library of Openzepplin package to prevent integer arithmetic overflow problems.

## Malicious Admins

To prevent malicious admin actions, admins power is limited. They can only add storage owner, can't manage products. Each user roles have own restrictions.

## Recursive Calls

ReentrancyGuard library of Openzepplin is used to prevent recursive calls. The nonReentrant modifier of the library is added all external call functions that modify the state.












