'use client'
import { JSX } from "react";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from 'yup'
import { RegisterDateInfo } from "./utils";
export default function Register(): JSX.Element {
  const dateInfo = RegisterDateInfo()
  const registerForm = useFormik({
    initialValues: {
        id: '',
        name: '',
        email: '',
        month: dateInfo.months,
        day: dateInfo.days,
        year: dateInfo.years,
        createdOn: new Date()
    }, validationSchema: Yup.object({
        id: Yup.string().uuid(),
        name: Yup.string().max(50).required('Required'),
        email: Yup.string().email().max(10).required('Required'),
        month: Yup.string()
    }),
    onSubmit: (values) => {

    }
  })
}