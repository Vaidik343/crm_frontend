import React, { useState, useCallback } from 'react'
import { useEffect } from 'react';
import { useEmployeeApplication } from  "../../context/EmployeeApplicationContext";
import { ENDPOINTS } from '../../api/endpoints';
import { MdDownload, MdPictureAsPdf, MdDescription } from 'react-icons/md';
import CreatableSelect from './CreatableSelect';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
const GenerateOfferLetter = ({application}) => {


  const EMPLOYMENT_OPTIONS = [
  { value: 'fulltime',       label: 'Full Time' },
  { value: 'halftime',       label: 'Half Time' },
  { value: 'work_from_home', label: 'Work From Home' },
];

  const [positions, setPositions] = useState([]);
  console.log("🚀 ~ GenerateOfferLetter ~ positions:", positions)
  const [addresses, setAddresses] = useState([]);
  console.log("🚀 ~ GenerateOfferLetter ~ addresses:", addresses)
  const [generating, setGenerating] = useState(false);

  const [format, setFormat] = useState('pdf');

  const [form, setForm] = useState({
    position:   '',
    position_name: '',
    office_address: '',
    address_name: '',
    start_date: '',
    employment_type: '',
    salary:  '',
  });


  const today = new Date(). toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  // fetch lookups
    const fetchLookups = useCallback(async () => {
      try {
        const [posRes, addrRes] = await Promise.all([
          api.get(ENDPOINTS.OFFER_LETTER.POSITIONS),
          api.get(ENDPOINTS.OFFER_LETTER.ADDRESSES),
        ]);
        console.log("🚀 ~ GenerateOfferLetter ~ posRes:", posRes)
        console.log("🚀 ~ GenerateOfferLetter ~ addrRes:", addrRes)
        setPositions(posRes.data.positions || []);
        setAddresses(addrRes.data.addresses || []);
      } catch (error) {
         console.log(error)
        toast.error('Failed to load lookup data.');
      }
    }, []);
  
    useEffect(() => { fetchLookups(); }, [fetchLookups]);
  
    const handleCreatePosition = async (name) => {
      const { data } = await api.post(ENDPOINTS.OFFER_LETTER.POSITIONS, { name });
      setPositions((prev) => [...prev, data.position]);
      return data.position;
    };
  
    const handleCreateAddress = async (name) => {
      const { data } = await api.post(ENDPOINTS.OFFER_LETTER.ADDRESSES, { name });
      setAddresses((prev) => [...prev, data.address]);
      return data.address;
    };
  

const handleGenerate = async () => {
  if (!form.position_name || !form.address_name || !form.start_date || !form.employment_type || !form.salary) {
    return toast.error('Please fill all fields before generating.');
  }
  try {
    setGenerating(true);
    const response = await api.post(
      ENDPOINTS.OFFER_LETTER.GENERATE(application.id),
      {
        position:        form.position_name,
        office_address:  form.address_name,
        start_date:      form.start_date,
        employment_type: form.employment_type,
        salary:          form.salary,
        format,
      },
      { responseType: 'blob' }
    );
    const ext      = format === 'pdf' ? 'pdf' : 'docx';
    const mimeType = format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const url  = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
    const link = document.createElement('a');
    link.href     = url;
    link.download = `offer-letter-${application.display_id}.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success(`Offer letter downloaded as ${ext.toUpperCase()}.`);
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Generation failed.');
  } finally {
    setGenerating(false);
  }
};
  
  
  return (
    <div className='mt-5 bg-white border border-slate-100 rounded-2xl overflow-auto'>
      
      <div className = "px-5 py-3 bg-slate-50 border-slate-100 flex items-center gap-2">
        <MdDownload  className='text-slate-400' />
        <p className='text-[10px] font-black uppercase tracking-widest text-slate-500'>Generate Offer Letter</p>
      </div>
      
      <div className='p-5 space-y-4'>
        {/* Auto date - readonly */}

        <div>
          <label className='block text-xs font-bold text-slate-500 mb-1.5'>Date (Auto)</label>

          <div className='w-full border border-slate-100 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 font-medium'>
            {today}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Position — creatable */}
          <CreatableSelect
            label="Position"
            options={positions}
            value={form.position}
            onChange={(id, name) => setForm((p) => ({ ...p, position: id, position_name: name }))}
            onCreate={handleCreatePosition}
            placeholder="e.g. Junior Developer"
          />

          {/* Office Address — creatable */}
          <CreatableSelect
            label="Office Address"
            options={addresses}
            value={form.office_address}
            onChange={(id, name) => setForm((p) => ({ ...p, office_address: id, address_name: name }))}
            onCreate={handleCreateAddress}
            placeholder="e.g. S-2, Diya Square, Anand"
          />

          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Start Date <span className="text-red-400">*</span></label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#132ea7]"
            />
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Employment Type <span className="text-red-400">*</span></label>
            <select
              value={form.employment_type}
              onChange={(e) => setForm((p) => ({ ...p, employment_type: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#132ea7] bg-white"
            >
              <option value="">Select type</option>
              {EMPLOYMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Salary */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Monthly Salary (INR) <span className="text-red-400">*</span></label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
              <input
                type="number"
                value={form.salary}
                onChange={(e) => setForm((p) => ({ ...p, salary: e.target.value }))}
                placeholder="e.g. 25000"
                className="w-full border border-slate-200 rounded-xl pl-8 pr-16 py-2.5 text-sm focus:outline-none focus:border-[#132ea7]"
              />
              {form.salary && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                  .00
                </span>
              )}
            </div>
            {form.salary && (
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Will appear as: {Number(form.salary).toLocaleString('en-IN')}.00 INR
              </p>
            )}
          </div>
        </div>
        <div>
  <label className="block text-xs font-bold text-slate-500 mb-2">Download Format</label>
  <div className="flex gap-2">
    <button type="button" onClick={() => setFormat('pdf')}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-colors ${
        format === 'pdf'
          ? 'border-red-500 bg-red-50 text-red-600'
          : 'border-slate-200 text-slate-400 hover:border-slate-300'
      }`}>
      <MdPictureAsPdf size={16} /> PDF
    </button>
    <button type="button" onClick={() => setFormat('docx')}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-colors ${
        format === 'docx'
          ? 'border-[#132ea7] bg-[#132ea7]/5 text-[#132ea7]'
          : 'border-slate-200 text-slate-400 hover:border-slate-300'
      }`}>
      <MdDescription size={16} /> Word
    </button>
  </div>
</div>
<button
  onClick={handleGenerate}
  disabled={generating}
  className={`w-full py-3 text-white rounded-xl font-black text-xs uppercase tracking-widest transition disabled:opacity-60 flex items-center justify-center gap-2 ${
    format === 'pdf' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#132ea7] hover:bg-[#0f2490]'
  }`}
>
  <MdDownload size={16} />
  {generating ? 'Generating...' : `Generate & Download ${format === 'pdf' ? 'PDF' : 'Word Doc'}`}
</button>

        {application.offer_letter_path && (
          <p className="text-[11px] text-slate-400 text-center">
            Last generated:{' '}
            <a
              href={application.offer_letter_path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#132ea7] font-black hover:underline"
            >
              Download previous
            </a>
          </p>
        )}
      </div>


    </div>
  )
}

export default GenerateOfferLetter