function Card({ data }) {
  if (!data) return null;

  return (
    <article className="card">
      <div
        className={`card__thumb ${
          data.white ? "card__thumb--white" : ""
        }`}
      >
        <img src={data.image} alt={data.alt} />
      </div>

      <h3 className="card__title">{data.title}</h3>
      <p className="card__meta">{data.period}</p>
      <p className="card__sub">{data.location}</p>
    </article>
  );
}

export default Card;
