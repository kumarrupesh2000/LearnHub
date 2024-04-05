import Logo from '../../assets/Logo/Dark2.png';
import { Link, matchPath } from 'react-router-dom';
import { NavbarLinks } from "../../data/navbar-links";
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ACCOUNT_TYPE } from "../../utils/constants"
import { BsChevronDown } from "react-icons/bs"
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai"
import ProfileDropdown from '../core/Auth/ProfileDropDown';
import { useEffect, useState } from 'react';
import { apiConnector } from '../../services/apiconnector';
import { categories } from '../../services/apis';
// import axios from 'axios';

function Navbar() {
    const location = useLocation();
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const { totalItems } = useSelector((state) => state.cart);
    // demo sublinks as api was not working

    // const sublinks = [
    //     {
    //         title: "python",
    //         link: "/catalog/python"
    //     },
    //     {
    //         title: "webdev",
    //         link: "/catalog/webdev"
    //     },
    //     {
    //         title: "ml",
    //         link: "/catalog/ml"
    //     },


    // ]
    // ye category wala jo drop down hogga usko dusre link pe le jayega
    const [subLinks, setSubLinks] = useState([]);
    const [loading, setLoading] = useState(false)
    console.log("showing sublinks data", subLinks);



    const fetchSublinks = async () => {
        try {
            // const result= axios.get(categories.CATEGORIES_API);
            setLoading(true)
            const result = await apiConnector("GET", categories.CATEGORIES_API);
            console.log("printing sublink result=>", result);
            setSubLinks(result?.data?.data);
            setLoading(false);





        }
        catch (err) {
            console.log("could not fetch category list");
        }
    }

    useEffect(() => {
        fetchSublinks();

    }, [])


    // agar koe confusion ho ek baar documentation dekh lena bhai

    const matchRoute = (route) => {
        return (matchPath({ path: route }, location.pathname));
    };

    return (
        <div className="flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700">
            <div className="flex w-11/12 max-w-maxContent items-center justify-between ">
                {/* Logo */}
                <Link to="/">
                    <img src={Logo} alt="Logo" width={160} height={32} loading="lazy" />
                </Link>
                {/* Nav Links */}
                <div className='flex gap-x-6 text-richblack-25'>
                    {NavbarLinks.map((link, index) => (
                        <div key={index}>
                            {(link.title === "Catalog") ?
                                (
                                    <div className='flex items-center gap-2 group relative'>
                                        <p>{link.title}</p>
                                        <BsChevronDown />
                                        <div className='invisible absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[50%] flex flex-col rounded-md bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 lg:w-[300px] z-50'>
                                            <div className="absolute left-[50%] top-0  h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5 "></div>
                                            {loading ? (
                                                <p className="text-center">Loading...</p>
                                            ) : subLinks.length ? (
                                                <>
                                                    {subLinks
                                                        ?.filter(
                                                            (subLink) => subLink?.courses?.length > 0
                                                        )
                                                        ?.map((subLink, i) => (
                                                            <Link
                                                                to={`/catalog/${subLink.name
                                                                    .split(" ")
                                                                    .join("-")
                                                                    .toLowerCase()}`}
                                                                className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                                                                key={i}
                                                            >
                                                                <p>{subLink.name}</p>
                                                            </Link>
                                                        ))}
                                                </>
                                            ) : (
                                                <p className="text-center">No Courses Found</p>
                                            )}

                                        </div>

                                    </div>) : (
                                    <Link key={index} to={link.title === "Catalog" ? "/" : link.path}>
                                        <div className={link.path && matchRoute(link.path) ? "text-yellow-25" : "text-richblack-25"}>
                                            {link.title}
                                        </div>
                                    </Link>


                                )}
                        </div>

                    ))}
                </div>
                {/* login signupp dashboard */}

                <div className="hidden items-center gap-x-4 md:flex">
                    {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                        <Link to="/dashboard/cart" className="relative">
                            <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
                            {totalItems > 0 && (
                                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    )}
                    {token === null && (
                        <Link to="/login">
                            <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                                Log in
                            </button>
                        </Link>
                    )}
                    {token === null && (
                        <Link to="/signup">
                            <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                                Sign up
                            </button>
                        </Link>
                    )}
                    {token !== null && <ProfileDropdown />}
                </div>
                <button className="mr-4 md:hidden">
                    <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
                </button>



            </div>
        </div>
    );
}

export default Navbar;
