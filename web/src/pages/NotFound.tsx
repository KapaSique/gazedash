import { Link } from "react-router-dom";

export default function NotFound(){
    return(
        <div style = {{padding: 16}}>
            <h2>404 - page not found</h2>
            <p style = {{opacity: 0.8}}>
                This route does not exist. Check URL or turn back.
            </p>
            <Link to ="/sessions">Go to sessions</Link>
        </div>
    );
}