import React from 'react'
import Navbar from '../src/components/Navbar/Navbar'
import AddressList from '../src/components/Address/AddressList/AddressList'
import Footersec from '../src/components/Footersection/Footersection'

const AddressListPage = () => {
  return (
    <>
        <Navbar/>
        <AddressList/>
        <Footersec/>
    </>
  )
}

export default AddressListPage