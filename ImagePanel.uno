using Uno;
using Uno.Collections;
using Uno.Graphics;
using Uno.UX;
using Uno.Threading;
using Fuse;
using Fuse.Resources;
using Fuse.Controls;
using Fuse.Elements;
using Fuse.Drawing;
using Fuse.Triggers;
using Fuse.Animations;
using WhileLoaded;

public class ImagePanel: Panel
{
        static public bool DEBUG = false;

        internal class ImagePanelSource: ImageSource
        {
                float _imageWidth, _imageHeight;

                public float ImageWidth
                {
                        get { return _imageWidth; }
                        set { _imageWidth = value; }
                }

                public float ImageHeight
                {
                        get { return _imageHeight; }
                        set { _imageHeight = value; }
                }

                public override float SizeDensity { get { return 1f; } }       
                public override int2 PixelSize { get { return int2((int)_imageWidth, (int)_imageHeight); } }
                public override float2 Size { get { return float2(_imageWidth, _imageHeight); } }
                public override texture2D GetTexture() { return null; }
                public override ImageSourceState State { get { return ImageSourceState.Ready; } }
        }

        Image _placeholderImage = new Image {
                //Visibility = Visibility.Hidden,
                Source = new ImagePanelSource()
        };

        Image _urlImage = new Image {
                Visibility = Visibility.Collapsed,
                //Layer = Fuse.Layer.Background
        };

        public float ImageWidth
        {
                get { return (_placeholderImage.Source as ImagePanelSource).ImageWidth; }
                set { (_placeholderImage.Source as ImagePanelSource).ImageWidth = value; }
        }

        public float ImageHeight
        {
                get { return (_placeholderImage.Source as ImagePanelSource).ImageHeight; }
                set { (_placeholderImage.Source as ImagePanelSource).ImageHeight = value; }
        }

        public String ImageUrl
        {
                get { return _urlImage.Name; }
                set { _urlImage.Name = value; }
        }


        public float ImageOpacity
        {
                get { return _urlImage.Opacity; }
                set { _urlImage.Opacity = value; }
        }

        public ImagePanel()
        {
                _urlImage.Unrooted += OnImageUnrooted;
                _urlImage.SourceChanged += OnImageSourceChanged;
                _placeholderImage.Children.Add(_urlImage);
                Children.Add(_placeholderImage);
        }

        bool IsImageLoaded()
        {
                return (_urlImage.Source != null && (_urlImage.Source.State == ImageSourceState.Ready || _urlImage.Source.State == ImageSourceState.Failed));
        }

        bool IsImageLoading()
        {
                return (_urlImage.Source != null && (_urlImage.Source.State == ImageSourceState.Pending || _urlImage.Source.State == ImageSourceState.Loading));
        }

        void OnImageUnrooted(object s, object a)
        {
                _urlImage.Unrooted -= OnImageUnrooted;
                ImageList.Remove(_urlImage);
                if (IsImageLoading()) _downloads--;
                if (DEBUG) debug_log "image unrooted, downloads: " + _downloads;
        }

        void OnImageSourceChanged(object s, object a)
        {
                if (DEBUG) debug_log "state change: " + _urlImage.Source.State + " " + _urlImage.Source.PixelSize + " (" + _urlImage.Url + ")";
                float2 UnusedVar = _urlImage.Source.PixelSize; // without this, delegat gets never called, hmm
                if (IsImageLoaded())
                {
                        _urlImage.SourceChanged -= OnImageSourceChanged;
                        ImageList.Remove(_urlImage);
                        _downloads--;
                        if (_urlImage.Source.State == ImageSourceState.Ready) {
                                _urlImage.Visibility = Visibility.Visible;
                                //float2 ps1 = (_placeholderImage.Source as ImagePanelSource).PixelSize, ps2 = UnusedVar;
                                //if (ps1 != ps2) debug_log ps1 + " -> " + ps2;
                                //WhileLoaded.SetState(this, true);
                        } else {
                                //WhileFailed.SetState(this, true, "Image loading error");
                        }
                        if (DEBUG) debug_log "imagesource loaded, downloads: " + _downloads;
                        UpdateManager.AddDeferredAction(NextImage);
                }
        }

        int _drawCount = 0;
        protected override void OnDrawControl(DrawContext dc)
        {
                base.OnDrawControl(dc);
                if (DEBUG) debug_log "drawing (" + _drawCount + ") " + (_placeholderImage.Source as ImagePanelSource).ImageWidth + "x" + (_placeholderImage.Source as ImagePanelSource).ImageHeight + ", _urlImage.Url is null: " + (_urlImage.Url == null);
                if (_drawCount++ == 0) UpdateManager.AddDeferredAction(AddImageToList);
        }

        void AddImageToList()
        {
                int i = ImageList.IndexOf(_urlImage);
                if (i >= 0) ImageList.RemoveAt(i);
                ImageList.Add(_urlImage);
                if (DEBUG) debug_log "image added, items: " + ImageList.Count;
                StartLoading(_urlImage);
        }

        static List<Image> ImageList = new List<Image>();
        static int MAX_DOWNLOADS = 2;
        static int _downloads = 0;
        //static Uno.Threading.Mutex _mutex = Uno.Threading.Mutex.Create();

        static void StartLoading(Image image)
        {
                //_mutex.Lock();
                if (_downloads >= MAX_DOWNLOADS)
                {
                        if (DEBUG) debug_log "startloading [debounced]";
                } else {
                        _downloads++;
                        if (DEBUG) debug_log "startloading, downloads: " + _downloads;
                        image.Url = image.Name;
                }
                //_mutex.Unlock();
        }

        static void NextImage()
        {
                Image image = null;
                for (int i = ImageList.Count - 1; i >= 0; i--)
                {
                        Image next = ImageList[i];
                        if (next.Url == null) {
                                image = next;
                                break;
                        }
                }
                if (image != null) StartLoading(image);
        }
}
