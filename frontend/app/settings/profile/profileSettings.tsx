"use client";
import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { RegisterDateInfo, url } from "@/app/utils";
export default function ProfileSettings() {
  const [birthday, setBirthday] = useState<boolean>(false);
  const username = localStorage.getItem("username");
  const changeBirthdayForm = useFormik({
    initialValues: {
      month: "",
      day: 0,
      year: 0,
    },
    validationSchema: Yup.object({
      month: Yup.string().required("Required"),
      day: Yup.number().required("Required"),
      year: Yup.number().required("Required"),
    }),
    onSubmit: async (values) => {
      const monthNumber = RegisterDateInfo(values.year).months.findIndex(
        (month: string) => month === values.month
      );
      const updatedBirthdate = new Date(values.year, monthNumber, values.day);
      try {
        const response = await axios.put(`${url}/${username}`, {
          birthDate: updatedBirthdate,
        });
        if (response.status === 200) {
          console.log("Successfully updated birthdate");
        }
      } catch {
        console.error("Error while updating birthdate");
      }
    },
  });
  return (
    <>
      <form onSubmit={changeBirthdayForm.handleSubmit}>
        <header>
          <button>Back</button>
          <div>Edit profile</div>
          <button>Save</button>
        </header>
        <main>
          <input type="file" placeholder="Add background photo" />
          <input type="file" placeholder="currentPhoto" />
        </main>
        <main>
          <div>
            <p>Name</p>
            <input type="text" />
          </div>
          <div>
            <p>Bio</p>
            <input type="text" />
          </div>
          <div>
            <input type="text" placeholder="Location" />
          </div>
          <div>
            <input type="text" placeholder="Website" />
          </div>
        </main>
        <footer>
          {!birthday && (
            <div onClick={() => setBirthday((previous: boolean) => !previous)}>
              <p>Birth Date</p>
              <p>...</p>
            </div>
          )}
          {birthday && (
            <div>
              <h4>Edit date of birth?</h4>
              <p>
                This can only be changed a few times. Make sure you enter the
                age of the person using the account.
              </p>
              <button>Edit</button>
              <button
                onClick={() => setBirthday((previous: boolean) => !previous)}
              >
                Cancel
              </button>
            </div>
          )}
        </footer>
      </form>
    </>
  );
}
