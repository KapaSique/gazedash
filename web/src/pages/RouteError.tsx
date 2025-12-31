import { Link, useRouteError} from "react-router-dom";

function formatError(e: unknown){
    if (e instanceof Error) return {title: e.name, message: e.message};
    return { title: "Uknown error", message: String(e)};
}

export default function RouteError(){
    const err = useRouteError();
    const { title, message } = formatError(err);
    
    return (
        <div style = {{padding: 16}}>
            <h2>Unexpected error</h2>
            <div style = {{marginTop: 8, opacity: 0.9}}>
                <div><b>{title}</b></div>
                <div style = {{whiteSpace: "pre-wrap"}}>{message}</div>
            </div>
            <div style = {{marginTop: 12}}>
                <Link to="/sessions">Back to sessions</Link>
            </div>
        </div>
    );
}