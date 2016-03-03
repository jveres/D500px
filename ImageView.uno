using Uno;
using Uno.Graphics;
using Fuse;
using Fuse.Resources;
using Fuse.Elements;
using Fuse.Triggers;
using WhileLoaded;
using WhileCacheLoaded;

public class ImageView: Element
{
        HttpImageSource _source = new HttpImageSource();

        public String ImageUrl
        {
                get { return _source.Url; }
                set { _source.Url = value; }
        }

        public MemoryPolicy ImageMemoryPolicy
        {
                get { return _source.Policy; }
                set { if (_source.Policy != value) _source.Policy = value; }
        }

        protected override void OnRooted()
        {
                base.OnRooted();
                _source.Changed += OnSourceChanged;
                WhileCacheLoaded.SetState(this, _source.State == ImageSourceState.Ready);
        }

        protected override void OnUnrooted()
        {
                _source.Changed -= OnSourceChanged;
                _source.Url = null; // abort pending Http request
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
                if (tex != null)
                        draw
                        {
                                apply Fuse.Drawing.Planar.Image;
                                DrawContext: dc;
                                Node: this;
                                Size: ActualSize;
                                Texture: tex;
                                BlendEnabled: false;
                                DepthTestEnabled: false;
                        };
        }
}