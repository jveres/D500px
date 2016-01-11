using Uno;
using Uno.Graphics;
using Fuse;
using Fuse.Resources;
using Fuse.Elements;
using Fuse.Controls;
using Fuse.Triggers;
using WhileLoaded;

public class ImageView: Element
{
        HttpImageSource _source = new HttpImageSource();

        public String ImageUrl
        {
                get { return _source.Url; }
                set { if (_source.Url != value) _source.Url = value; }
        }

        public MemoryPolicy ImageMemoryPolicy
        {
                get { return _source.Policy; }
                set { if (_source.Policy != value) _source.Policy = value; }
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

        void OnSourceChanged(object Source, object Args)
        {
                if (_source.State == ImageSourceState.Ready) UpdateManager.AddDeferredAction(InvalidateVisual);
                WhileLoaded.SetState(this, _source.State == ImageSourceState.Ready);
                WhileFailed.SetState(this, _source.State == ImageSourceState.Failed, "Image loading error");
                WhileLoading.SetState(this, _source.State == ImageSourceState.Loading);
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