const StatCard = ({title, value, icon, color = 'primary'}) => {

    return(
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
                <div className={`d-flex align-items-center justify-content-center rounded-3 bg-${color} bg-opacity-10`}
                 style={{width: 52, height: 52, fontSize: 24, flexShrink: 0}}
                >
                    {icon}

                </div>
            </div>
        </div>
    )
}