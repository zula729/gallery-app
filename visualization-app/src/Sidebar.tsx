
function Sidebar() {
  return (
    <div className="sidebar">
        <nav>
          <ul>
            <li><div className= "rounded-sm flex items-center justify-center "><a href="#home">Home</a></div></li>
            <li><div className= "rounded-sm "><a href="#gallery">Gallery</a></div></li>
            <li><div className= "rounded-sm "><a href="#visualization">Visualization</a></div></li>
          </ul>
        </nav>
    </div>
  );
}

export default Sidebar;