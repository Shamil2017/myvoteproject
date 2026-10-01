"use client";

import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type OptionCardProps = {
  index: bigint;
  name: string;
  voteCount: bigint;
  totalVotes: bigint;
  hasVoted: boolean;
  isPending: boolean;
  onVote: (index: bigint) => Promise<void>;
};

function OptionCard({ index, name, voteCount, totalVotes, hasVoted, isPending, onVote }: OptionCardProps) {
  const percentage = totalVotes > 0n ? Number((voteCount * 100n) / totalVotes) : 0;

  return (
    <div className="rounded-xl bg-base-100 p-5 shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{name}</h3>

        <span className="text-lg font-bold">{percentage}%</span>
      </div>

      <p className="mt-2">Голосов: {voteCount.toString()}</p>

      <progress className="progress progress-primary mt-3 w-full" value={percentage} max="100" />

      <button className="btn btn-primary mt-4 w-full" onClick={() => onVote(index)} disabled={isPending || hasVoted}>
        {hasVoted ? "Вы уже проголосовали" : isPending ? "Транзакция..." : "Голосовать"}
      </button>
    </div>
  );
}

export default function Home() {
  const { address } = useAccount();

  const { data: question } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "question",
  });

  const { data: option0 } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "options",
    args: [0n],
    watch: true,
  });

  const { data: option1 } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "options",
    args: [1n],
    watch: true,
  });

  const { data: option2 } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "options",
    args: [2n],
    watch: true,
  });

  const { data: hasVoted } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "hasVoted",
    args: [address],
    watch: true,
  });

  const { writeContractAsync: writeVotingAsync, isPending } = useScaffoldWriteContract({
    contractName: "Voting",
  });

  const vote0 = option0?.[1] ?? 0n;
  const vote1 = option1?.[1] ?? 0n;
  const vote2 = option2?.[1] ?? 0n;

  const totalVotes = vote0 + vote1 + vote2;

  const handleVote = async (index: bigint) => {
    try {
      await writeVotingAsync({
        functionName: "vote",
        args: [index],
      });
    } catch (error) {
      console.error("Ошибка голосования:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Децентрализованное голосование</h1>

          <p className="mb-8 text-lg">Голосование работает на локальной сети Ethereum</p>
        </div>

        <div className="rounded-2xl bg-base-200 p-8 shadow-lg">
          <h2 className="mb-4 text-center text-2xl font-semibold">Вопрос</h2>

          <p className="mb-4 text-center text-xl">{question ?? "Загрузка вопроса..."}</p>

          <p className="mb-6 text-center font-semibold">Всего голосов: {totalVotes.toString()}</p>

          {hasVoted && (
            <div className="alert alert-success mb-6">
              <span>Ваш адрес уже проголосовал. Повторное голосование запрещено.</span>
            </div>
          )}

          <div className="grid gap-4">
            <OptionCard
              index={0n}
              name={option0?.[0] ?? "Python"}
              voteCount={vote0}
              totalVotes={totalVotes}
              hasVoted={hasVoted ?? false}
              isPending={isPending}
              onVote={handleVote}
            />

            <OptionCard
              index={1n}
              name={option1?.[0] ?? "JavaScript"}
              voteCount={vote1}
              totalVotes={totalVotes}
              hasVoted={hasVoted ?? false}
              isPending={isPending}
              onVote={handleVote}
            />

            <OptionCard
              index={2n}
              name={option2?.[0] ?? "Solidity"}
              voteCount={vote2}
              totalVotes={totalVotes}
              hasVoted={hasVoted ?? false}
              isPending={isPending}
              onVote={handleVote}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
