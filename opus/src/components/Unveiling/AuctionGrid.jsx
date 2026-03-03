import AuctionCard from "./AuctionCard";

export default function AuctionGrid({ items = [] }) {
  if (!items.length) return null;

  return (
    <>
      {items.map((item) => (
        <AuctionCard key={item.id} item={item} />
      ))}
    </>
  );
}
