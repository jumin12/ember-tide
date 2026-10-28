"""Read ElevenLabs credentials from the environment or Windows Credential Manager."""
import os,ctypes
from ctypes import wintypes
TARGET='Codex/ElevenLabs'
class CREDENTIAL(ctypes.Structure):
 _fields_=[('Flags',wintypes.DWORD),('Type',wintypes.DWORD),('TargetName',wintypes.LPWSTR),('Comment',wintypes.LPWSTR),('LastWritten',wintypes.FILETIME),('CredentialBlobSize',wintypes.DWORD),('CredentialBlob',ctypes.POINTER(ctypes.c_ubyte)),('Persist',wintypes.DWORD),('AttributeCount',wintypes.DWORD),('Attributes',ctypes.c_void_p),('TargetAlias',wintypes.LPWSTR),('UserName',wintypes.LPWSTR)]
def get_key():
 key=os.getenv('ELEVENLABS_API_KEY') or os.getenv('XI_API_KEY')
 if key:return key
 if os.name!='nt':raise RuntimeError('Configure ELEVENLABS_API_KEY')
 adv=ctypes.WinDLL('Advapi32.dll');ptr=ctypes.POINTER(CREDENTIAL)()
 adv.CredReadW.argtypes=[wintypes.LPCWSTR,wintypes.DWORD,wintypes.DWORD,ctypes.POINTER(ctypes.POINTER(CREDENTIAL))]
 if not adv.CredReadW(TARGET,1,0,ctypes.byref(ptr)):raise RuntimeError('ElevenLabs credential is not configured')
 try:return ctypes.string_at(ptr.contents.CredentialBlob,ptr.contents.CredentialBlobSize).decode('utf-8')
 finally:adv.CredFree(ptr)
def store_key(key):
 raw=key.encode('utf-8');blob=(ctypes.c_ubyte*len(raw)).from_buffer_copy(raw);c=CREDENTIAL();c.Type=1;c.TargetName=TARGET;c.CredentialBlobSize=len(raw);c.CredentialBlob=blob;c.Persist=2;c.UserName='ElevenLabs API'
 adv=ctypes.WinDLL('Advapi32.dll');adv.CredWriteW.argtypes=[ctypes.POINTER(CREDENTIAL),wintypes.DWORD]
 if not adv.CredWriteW(ctypes.byref(c),0):raise RuntimeError('Could not save the credential')
