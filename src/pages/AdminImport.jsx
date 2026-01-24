import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { base44 } from '@/api/base44Client';
import { Upload, Download, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';

const CSV_TEMPLATE = `name,description,short_description,type,age_min,age_max,max_capacity,length_m,width_m,height_m,min_space_length,min_space_width,requires_power,power_outlets_needed,setup_time_minutes,indoor_suitable,outdoor_suitable,surface_types,base_price,price_per_hour,delivery_price,is_active
Zamek Tęczowy,Klasyczny kolorowy zamek do skakania,Kolorowy zamek dla dzieci,castle,3,12,8,4,4,3,5,5,true,1,15,false,true,grass;asphalt,450,50,100,true
Zjeżdżalnia Gigant,Duża zjeżdżalnia z basenem,Wysoka zjeżdżalnia z wodą,slide,5,99,6,8,4,6,10,6,true,2,20,false,true,grass,650,75,150,true`;

export default function AdminImport() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'szablon-dmucha.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Proszę wybrać plik CSV');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await base44.functions.invoke('importInflatables', formData);
      setResult(response.data);
      setFile(null);
    } catch (error) {
      setResult({
        success: 0,
        failed: 0,
        errors: [error.message]
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Import dmuchańców z CSV</h1>
        <p className="text-slate-600 mt-1">Zaimportuj wiele dmuchańców jednocześnie używając pliku CSV</p>
      </div>

      <div className="grid gap-6">
        {/* Download Template */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="w-5 h-5 text-violet-600" />
              Krok 1: Pobierz szablon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Pobierz szablon CSV z przykładowymi danymi. Uzupełnij go swoimi dmuchańcami.
            </p>
            <Button onClick={downloadTemplate} variant="outline" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Pobierz szablon CSV
            </Button>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-semibold text-slate-800 mb-2">Wymagane pola:</p>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li><strong>name</strong> - nazwa dmuchańca</li>
                <li><strong>type</strong> - typ: slide, castle, obstacle_course, combo, for_toddlers, interactive, other</li>
                <li><strong>base_price</strong> - cena bazowa (liczba)</li>
              </ul>
              <p className="text-sm font-semibold text-slate-800 mt-4 mb-2">Opcjonalne pola:</p>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li><strong>description</strong> - pełny opis</li>
                <li><strong>short_description</strong> - krótki opis do karty</li>
                <li><strong>age_min, age_max</strong> - przedział wiekowy (liczby)</li>
                <li><strong>max_capacity</strong> - pojemność (liczba)</li>
                <li><strong>length_m, width_m, height_m</strong> - wymiary w metrach (liczby)</li>
                <li><strong>min_space_length, min_space_width</strong> - minimalna przestrzeń (liczby)</li>
                <li><strong>requires_power</strong> - czy wymaga prądu (true/false)</li>
                <li><strong>indoor_suitable, outdoor_suitable</strong> - czy nadaje się do wnętrz/na zewnątrz (true/false)</li>
                <li><strong>surface_types</strong> - dozwolone nawierzchnie oddzielone średnikiem (np: grass;asphalt;indoor)</li>
                <li><strong>setup_time_minutes</strong> - czas montażu w minutach (liczba)</li>
                <li><strong>price_per_hour</strong> - cena za dodatkową godzinę (liczba)</li>
                <li><strong>delivery_price</strong> - cena dostawy (liczba)</li>
                <li><strong>is_active</strong> - czy aktywny (true/false, domyślnie true)</li>
              </ul>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Uwaga:</strong> Zdjęcia musisz dodać osobno w zakładce "Dmuchańce" po zaimportowaniu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload File */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5 text-violet-600" />
              Krok 2: Wgraj plik CSV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-600
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-violet-50 file:text-violet-700
                    hover:file:bg-violet-100
                    cursor-pointer"
                />
              </div>

              {file && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-slate-600" />
                  <span className="text-sm text-slate-800 flex-1">{file.name}</span>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importuję...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Importuj
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Alert className={result.failed === 0 ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}>
            <div className="flex items-start gap-3">
              {result.failed === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription>
                  <p className="font-semibold mb-2">
                    Zaimportowano: {result.success} | Błędy: {result.failed}
                  </p>
                  {result.errors?.length > 0 && (
                    <div className="mt-3 p-3 bg-white rounded-lg text-sm space-y-1">
                      <p className="font-semibold text-slate-800 mb-2">Szczegóły błędów:</p>
                      {result.errors.slice(0, 10).map((error, idx) => (
                        <p key={idx} className="text-slate-600">• {error}</p>
                      ))}
                      {result.errors.length > 10 && (
                        <p className="text-slate-500 italic">...i {result.errors.length - 10} więcej</p>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
}