const Card = ({ title, icon, value, stats, loading }) => {
    return (
        <div className="column is-12-mobile is-6-tablet is-3-desktop">
            <div className="stat-card">
                <div className="is-flex is-justify-content-between is-align-items-start mb-3">
                    <div>
                        <p className="is-size-7 has-text-weight-bold has-text-grey is-uppercase mb-1" style={{ letterSpacing: "1px" }}>
                            {title}
                        </p>
                        <div className="is-flex is-align-items-center is-gap-1" style={{ gap: "0.75rem" }}>
                            <div className="stat-card-icon">
                                {icon}
                            </div>
                            <div className="stat-number">
                                {loading ? "..." : value}
                            </div>
                        </div>
                    </div>
                </div>
                <p className="is-size-7 has-text-grey mb-0">
                    {stats}
                </p>
            </div>
        </div>
    )
}

export default Card;