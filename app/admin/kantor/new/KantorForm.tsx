/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/kantor/new/KantorForm.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
    >
      {pending ? "Menyimpan..." : "Simpan"}
    </button>
  );
}

export default function KantorForm({ formAction }: { formAction: any }) {
  const [state, dispatch] = useFormState(formAction, { message: null });

  return (
    <form
      action={dispatch}
      className="bg-white p-6 rounded-lg shadow-md max-w-lg"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="nama" className="block font-medium">
            Nama Kantor
          </label>
          <input
            type="text"
            name="nama"
            id="nama"
            required
            className="w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="regional" className="block font-medium">
            Regional
          </label>
          <input
            type="text"
            name="regional"
            id="regional"
            required
            className="w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="timezone" className="block font-medium">
            Timezone
          </label>
          <select
            name="timezone"
            id="timezone"
            required
            className="w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
            <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
            <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
          </select>
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="latitude" className="block font-medium">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              name="latitude"
              id="latitude"
              required
              className="w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="longitude" className="block font-medium">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              name="longitude"
              id="longitude"
              required
              className="w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="radius" className="block font-medium">
            Radius Absen (meter)
          </label>
          <input
            type="number"
            name="radius"
            id="radius"
            defaultValue="15"
            required
            className="w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
      </div>

      <div className="mt-6">
        <SubmitButton />
      </div>

      {state?.message && (
        <p className="mt-4 text-sm text-red-600 bg-red-100 p-2 rounded-md">
          {state.message}
        </p>
      )}
    </form>
  );
}
