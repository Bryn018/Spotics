import { useState, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { Upload, FileArchive, AlertCircle, Loader2, Terminal, ChevronRight } from 'lucide-react';
import { useData, RawTrack } from '../context/DataContext';

export function Landing() {
  const navigate = useNavigate();
  const { loadData } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const processZip = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setFileName(file.name);

    try {
      const zip = await JSZip.loadAsync(file);

      // Spotify GDPR exports contain JSON files with streaming history
      // Look for files like "StreamingHistory0.json", "StreamingHistory1.json", etc.
      // Also support "Streaming_History_Audio_*.json" (newer format)
      const allFiles = Object.keys(zip.files);

      let historyFiles = allFiles.filter(name => {
        const lower = name.toLowerCase();
        return (lower.includes('streaminghistory') || lower.includes('streaming_history_audio')) &&
               lower.endsWith('.json');
      });

      // Fallback: look in subdirectories
      if (historyFiles.length === 0) {
        historyFiles = allFiles.filter(name => {
          const parts = name.toLowerCase().split('/');
          const filename = parts[parts.length - 1];
          return (filename.startsWith('streaminghistory') || filename.startsWith('streaming_history_audio')) &&
                 filename.endsWith('.json');
        });
      }

      if (historyFiles.length === 0) {
        // Last resort: look for any JSON with track data
        const jsonFiles = allFiles.filter(n => n.toLowerCase().endsWith('.json'));
        if (jsonFiles.length === 0) {
          throw new Error('No JSON files found in ZIP. Please upload a Spotify GDPR export.');
        }
        // Try to find one with track-like data
        for (const jf of jsonFiles.slice(0, 5)) {
          const content = await zip.files[jf].async('string');
          try {
            const data = JSON.parse(content);
            if (Array.isArray(data) && data.length > 0 && (data[0].ms_played !== undefined || data[0].msPlayed !== undefined)) {
              historyFiles.push(jf);
            }
          } catch { /* not JSON */ }
        }
      }

      if (historyFiles.length === 0) {
        throw new Error('No Spotify streaming history found in ZIP. Make sure you uploaded the correct GDPR export.');
      }

      // Parse all history files
      const allTracks: RawTrack[] = [];
      for (const hf of historyFiles) {
        const content = await zip.files[hf].async('string');
        let data: any[];
        try {
          data = JSON.parse(content);
        } catch {
          continue;
        }
        if (!Array.isArray(data)) continue;

        for (const item of data) {
          // Support both old and new Spotify GDPR formats
          const track: RawTrack = {
            ts: item.ts || item.endTime || item.timestamp || '',
            ms_played: item.ms_played || item.msPlayed || 0,
            master_metadata_track_name: item.master_metadata_track_name || item.trackName || item.track_name || 'Unknown Track',
            master_metadata_album_artist_name: item.master_metadata_album_artist_name || item.artistName || item.artist_name || 'Unknown Artist',
            master_metadata_album_album_name: item.master_metadata_album_album_name || item.albumName || item.album_name || 'Unknown Album',
            platform: item.platform || item.platform || undefined,
            reason_start: item.reason_start || item.reasonStart || undefined,
            reason_end: item.reason_end || item.reasonEnd || undefined,
            skipped: item.skipped || (item.ms_played < 30000),
            shuffle: item.shuffle || undefined,
          };
          if (track.ts && track.ms_played > 0) {
            allTracks.push(track);
          }
        }
      }

      if (allTracks.length === 0) {
        throw new Error('No valid tracks found in the export. The file might be empty or in an unexpected format.');
      }

      // Sort by timestamp
      allTracks.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

      loadData(allTracks);
      navigate('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to process ZIP file');
    } finally {
      setIsProcessing(false);
    }
  }, [loadData, navigate]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processZip(file);
  }, [processZip]);

  const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processZip(file);
  }, [processZip]);

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)' }} />

      {/* Terminal header */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Terminal className="h-6 w-6 text-green-500" />
            <span className="text-green-500 font-mono text-sm">v2.0.0-static</span>
          </div>
          <h1 className="text-5xl font-bold font-mono mb-3 text-green-400 tracking-tight">
            spotics
          </h1>
          <p className="text-gray-400 text-lg font-mono">
            your music data. your browser. no servers.
          </p>
        </div>

        {/* Upload area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            relative rounded-lg border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer
            ${isDragging
              ? 'border-green-400 bg-green-500/10 scale-[1.02]'
              : 'border-gray-700 hover:border-green-500/50 hover:bg-green-500/5'}
            ${isProcessing ? 'pointer-events-none opacity-60' : ''}
          `}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".zip"
            onChange={handleFileInput}
            className="hidden"
          />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
              <div>
                <p className="text-green-400 font-mono text-lg">Processing {fileName}...</p>
                <p className="text-gray-500 font-mono text-sm mt-1">Parsing your listening history</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {isDragging ? (
                <FileArchive className="h-12 w-12 text-green-400" />
              ) : (
                <Upload className="h-12 w-12 text-gray-500" />
              )}
              <div>
                <p className="text-gray-200 text-lg font-mono">
                  {isDragging ? 'Drop your ZIP here' : 'Upload Spotify GDPR Export'}
                </p>
                <p className="text-gray-500 font-mono text-sm mt-2">
                  Drag & drop or click to browse
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 rounded-lg bg-gray-900/50 border border-gray-800">
          <h2 className="text-green-400 font-mono text-sm mb-4 flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            How to get your data
          </h2>
          <ol className="space-y-3 text-gray-400 font-mono text-sm">
            <li className="flex items-start gap-3">
              <span className="text-green-500 shrink-0">01.</span>
              <span>Go to <span className="text-green-400">spotify.com/privacy</span> and log in</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 shrink-0">02.</span>
              <span>Scroll to "Download your data" and request your extended streaming history</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 shrink-0">03.</span>
              <span>Wait for Spotify to email you a download link (can take up to 30 days)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 shrink-0">04.</span>
              <span>Download the ZIP and upload it here — all processing happens in your browser</span>
            </li>
          </ol>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 font-mono text-xs">
            No data is ever sent to any server. 100% client-side processing.
          </p>
        </div>
      </div>
    </div>
  );
}
