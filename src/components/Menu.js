import React from "react";
import { Link } from "react-router-dom";

const Menu = () => {
  return (
    <div className="ui stackable secondary pointing menu">
      <Link className="header item" to="/">
        PlasmoCount
      </Link>
      <Link className="active item" to="/">
        Home
      </Link>
      <Link className="item" to="/">
        About
      </Link>
      <div className="right menu">
        <div className="ui item">
          <p>
            Created by the{" "}
            <a
              href="https://www.baumlab.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Baum Lab
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Menu;
