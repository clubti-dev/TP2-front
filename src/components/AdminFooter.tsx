import clubtiLogoV3 from "@/assets/clubti_logo_v3.png";

const AdminFooter = () => {
    return (
        <footer className="bg-primary/5 border-t border-primary/10 py-4 px-8 mt-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <a
                        href="https://www.clubti.com.br"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity"
                    >
                        <img src={clubtiLogoV3} alt="ClubTI" className="h-8" />
                    </a>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href="https://wa.me/559899314044"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-green-600 transition-colors"
                        title="Suporte Técnico"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5"
                        >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.304-5.291c0-5.438 4.411-9.849 9.85-9.849 2.631 0 5.108 1.026 6.968 2.885 1.861 1.86 2.886 4.337 2.886 6.969 0 5.439-4.412 9.849-9.851 9.849m8.33-13.99A11.812 11.812 0 0012.05 2.436c-6.57 0-11.918 5.348-11.918 11.918 0 2.105.546 4.165 1.588 5.988L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.57 0 11.918-5.349 11.918-11.918 0-3.185-1.24-6.18-3.493-8.433" />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default AdminFooter;
