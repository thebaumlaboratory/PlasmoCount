import React from "react";

const Menu = () => {
  return (
    <div className="ui secondary pointing menu">
      <div className="header item">Malaria detection</div>
      <a className="active item">Home</a>
      <a className="item">About</a>
      <a className="item" style={{ color: "#B03060" }}>
        Contribute
      </a>
      <div className="right menu">
        <div className="ui item">
          <p>
            Created by the{" "}
            <a href="https://www.baumlab.com/" target="_blank">
              Baum Lab
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Menu;
