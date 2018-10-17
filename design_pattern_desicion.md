# Design Pattern Decision

Fail early and fail loud pattern (AFAIK this is so close Checks-Effects-Interactions. https://solidity.readthedocs.io/en/develop/security-considerations.html#use-the-checks-effects-interactions-pattern) is used as much as possible in this project.

Restricting Access pattern is used to determinate prevent for unauthorized using.

To use Mortal Pattern, Destructible contract is imlemented from Open Zepplin library.

Withdrawal pattern is used (this is close "pull payment system" AFAIK. https://consensys.github.io/smart-contract-best-practices/recommendations/#favor-pull-over-push-for-external-calls). It protects against re-entrancy and denial of service attacks.
I would like to implemented payment/PullPayment of Openzepplin but i didn't want to override withdrawPayments method of it. Because it is public and i have to add a modifier to allow withdraw operation only to store owners.

To implementing an emergency stop / Circuit Breaker mechanism, i implemented lifecycle/Pausable contract.

In this project, Checks-Effects-Interaction pattern is used as much as possible.

