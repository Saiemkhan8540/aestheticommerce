import React from 'react'
import Navbar from '../src/components/Navbar/Navbar'
import OrderList from '../src/components/Order/OrderList/OrderList'
import Footersec from '../src/components/Footersection/Footersection'

const ordersPage = () => {
  return (
    <>
        <Navbar/>
        <h1>Orders Page</h1>
        <OrderList/>
        <Footersec/>
    </>
  )
}

export default ordersPage