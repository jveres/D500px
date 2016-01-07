using Uno;
using Uno.Graphics;
using Fuse;
using Fuse.Resources;
using Fuse.Elements;

public class ImageView: Element
{
        HttpImageSource _source = new HttpImageSource();

        public float ImageWidth { get; set; }
        public float ImageHeight { get; set; }
        public String ImageUrl
        {
                get { return _source.Url; }
                set { _source.Url = value; }
        }

        public ImageView()
        {
                CachingMode = CachingMode.Optimized;
        }

        protected override void OnRooted()
        {
                base.OnRooted();
                _source.Changed += OnSourceChanged;
        }

        protected override void OnUnrooted()
        {
                _source.Changed -= OnSourceChanged;
                base.OnUnrooted();
        }

        protected override float2 GetContentSize(float2 fillSize, SizeFlags fillSet)
        {
                return float2(ImageWidth, ImageHeight);
        }

        public override float2 GetMarginSize(float2 fillSize, SizeFlags fillSet)
        {
                return float2(fillSize.X, ImageHeight * (fillSize.X / ImageWidth));
        }

        void OnSourceChanged(object Source, object Args)
        {
                if (_source.State == ImageSourceState.Ready) UpdateManager.AddDeferredAction(InvalidateVisual);
        }

        protected override void OnDraw(DrawContext dc)
        {
                texture2D tex = _source.GetTexture();
                if (tex == null) return;
                draw
                {
                        apply Fuse.Drawing.Planar.Image;
                        DrawContext: dc;
                        Node: this;
                        Size: ActualSize;
                        Texture: tex;
                        BlendEnabled: false;
                };
        }
}